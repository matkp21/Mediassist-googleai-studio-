const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin');
admin.initializeApp();

// Import Vertex AI
const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;
const { GoogleAuth } = require('google-auth-library');


// Helper for automatic retries with exponential backoff
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, options);
    } catch (error) {
      const isTransient = error.response && [408, 429, 500, 502, 503, 504].includes(error.response.status);
      const isNetworkError = !error.response && error.request;
      
      if ((isTransient || isNetworkError) && attempt < retries) {
        console.warn(`[API Warning] ${url} failed on attempt ${attempt}. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
};

// Helper to throw a consistent, user-friendly HttpsError from external API errors
const throwHttpsErrorFromApi = (error, apiName) => {
  console.error(`Error calling ${apiName} API:`, error.response ? error.response.data : error.message);
  
  // User-friendly error messaging based on the error type
  let message = `We're currently having trouble connecting to ${apiName}. Please try again in a moment.`;
  
  if (error.response) {
    const status = error.response.status;
    if (status === 404) {
      message = `We couldn't find the requested medical information in the ${apiName} database. Please verify the name and try again.`;
    } else if (status === 429) {
      message = `${apiName} is currently experiencing unusually high traffic. Please wait a few moments and try your request again.`;
    } else if (status >= 500) {
      message = `The ${apiName} systems are currently unavailable. Their engineers are likely working on it.`;
    } else if (status === 400) {
      message = `The search query provided to ${apiName} was invalid. Please refine your medical query.`;
    }
  } else if (error.request) {
    message = `No response received from ${apiName}. It seems their network might be temporarily offline.`;
  } else {
    message = `An unexpected error occurred while preparing your request to ${apiName}.`;
  }
  
  throw new functions.https.HttpsError('internal', message);
};


// Search Drug via OpenFDA
exports.searchDrug = functions.https.onCall(async (data, context) => {
  const drugName = data.drugName;
  if (!drugName) {
    throw new functions.https.HttpsError('invalid-argument', 'Drug name is required.');
  }
  try {
    const response = await fetchWithRetry(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(drugName)}&limit=1`);
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    } else {
      return { message: 'No drug data found for the specified name on OpenFDA.' };
    }
  } catch (error) {
    throwHttpsErrorFromApi(error, 'OpenFDA');
  }
});

// Search Gene via MedlinePlus Genetics
exports.searchGene = functions.https.onCall(async (data, context) => {
  const geneName = data.geneName;
  if (!geneName) {
    throw new functions.https.HttpsError('invalid-argument', 'Gene name is required.');
  }
  try {
    const response = await fetchWithRetry(
      `https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.1&mainSearchCriteria.v.c=${encodeURIComponent(geneName)}&knowledgeResponseType=application/json`
    );
    if (response.data && response.data.feed && response.data.feed.entry && response.data.feed.entry.length > 0) {
      const entry = response.data.feed.entry[0];
      return {
        title: entry.title && entry.title._value ? entry.title._value : 'No title found',
        summary: entry.summary && entry.summary._value ? entry.summary._value.substring(0,500) + '...' : 'No summary found',
        link: entry.link && entry.link[0] && entry.link[0].href ? entry.link[0].href : null
      };
    } else {
      return { message: 'No gene data found for the specified name on MedlinePlus Connect or unexpected JSON structure.' };
    }
  } catch (error) {
    throwHttpsErrorFromApi(error, 'MedlinePlus Connect');
  }
});


// Example for HIPAASpace ICD-10 (Requires API Token)
exports.searchICD10 = functions.https.onCall(async (data, context) => {
  const diseaseName = data.diseaseName;
  const apiToken = functions.config().hipaaspace ? functions.config().hipaaspace.key : null;

  if (!apiToken) {
      console.error("HIPAASpace API key not configured in Firebase Functions config.");
      throw new functions.https.HttpsError('failed-precondition', 'API key for HIPAASpace not configured.');
  }

  if (!diseaseName) {
    throw new functions.https.HttpsError('invalid-argument', 'Disease name is required.');
  }
  try {
    const response = await fetchWithRetry(
      `https://www.hipaaspace.com/api/icd10/search?q=${encodeURIComponent(diseaseName)}&token=${apiToken}`
    );
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const firstResult = response.data[0];
      return {
        name: firstResult.Description || firstResult.description || 'N/A',
        code: firstResult.Code || firstResult.code || 'N/A'
      };
    } else if (response.data && response.data["no results"]){
        return { message: `No ICD-10 codes found for "${diseaseName}" on HIPAASpace.` };
    }
     else {
      return { message: `No ICD-10 codes found for "${diseaseName}" on HIPAASpace or unexpected response.` };
    }
  } catch (error) {
    throwHttpsErrorFromApi(error, 'HIPAASpace ICD-10');
  }
});

// Simple health check function
exports.healthCheck = functions.https.onCall(async (data, context) => {
  console.log("Health check function called. Data:", data, "Context Auth:", context.auth ? "Authenticated" : "Unauthenticated");
  return { status: "ok", timestamp: new Date().toISOString(), message: "Backend API is responsive." };
});


// Invoke MedGemma model deployed on Vertex AI
exports.invokeMedGemma = functions.runWith({
  timeoutSeconds: 300, // Increased timeout for potentially longer LLM responses
  memory: '1GB' // Adjust memory as needed
}).https.onCall(async (data, context) => {
  // Ensure the user is authenticated if necessary for your app logic
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }

  const promptText = data.prompt;
  if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "prompt" argument.');
  }

  const medGemmaConfig = functions.config().medgemma;
  if (!medGemmaConfig || !medGemmaConfig.project_id || !medGemmaConfig.location_id || !medGemmaConfig.endpoint_id) {
    console.error("MedGemma configuration (project_id, location_id, endpoint_id) not set in Firebase Functions config.");
    throw new functions.https.HttpsError('failed-precondition', 'MedGemma service is not configured. Please contact the administrator.');
  }

  const projectId = medGemmaConfig.project_id;
  const location = medGemmaConfig.location_id;
  const endpointId = medGemmaConfig.endpoint_id;

  const clientOptions = {
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
    auth: new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }), // Ensure the Cloud Function service account has 'Vertex AI User' role or similar
  };

  const client = new PredictionServiceClient(clientOptions);

  const endpoint = `projects/${projectId}/locations/${location}/endpoints/${endpointId}`;

  const instances = [{
    prompt: promptText,
    // Add other parameters expected by your VLLM serving container if needed
    // e.g., max_tokens: 1024, temperature: 0.7
  }];
  const parameters = { // Example parameters, adjust as needed for MedGemma/VLLM
    temperature: 0.2,
    maxOutputTokens: 1024, // Adjust as needed
    topP: 0.8,
    topK: 40,
  };

  const request = {
    endpoint,
    instances: instances.map(instance => ({
      structValue: { // VLLM often expects a structValue
        fields: {
          prompt: { stringValue: instance.prompt },
          // If your VLLM container expects parameters per instance:
          // max_tokens: { numberValue: instance.max_tokens || 1024 },
          // temperature: { numberValue: instance.temperature || 0.2 }
        }
      }
    })),
    parameters: { // Parameters might be at the top level or per instance depending on container
        structValue: {
            fields: {
                temperature: { numberValue: parameters.temperature },
                maxOutputTokens: { numberValue: parameters.maxOutputTokens },
                topP: { numberValue: parameters.topP },
                topK: { numberValue: parameters.topK },
            }
        }
    }
  };

  try {
    console.log(`Sending request to MedGemma endpoint: ${endpoint} with prompt: "${promptText.substring(0,100)}..."`);
    const [response] = await client.predict(request);

    if (!response.predictions || response.predictions.length === 0) {
      console.error("MedGemma returned no predictions.");
      throw new functions.https.HttpsError('internal', 'MedGemma model returned no predictions.');
    }

    // Assuming VLLM output structure like: { "predictions": [ { "generated_text": "..." } ] }
    // Or it might be a simple string prediction if the container is configured differently
    // You might need to inspect the exact structure of `response.predictions[0]`
    const prediction = response.predictions[0];
    let generatedText = '';

    if (prediction.structValue && prediction.structValue.fields && prediction.structValue.fields.generated_text) {
        generatedText = prediction.structValue.fields.generated_text.stringValue;
    } else if (prediction.stringValue) { // Simpler case if it's just a string value
        generatedText = prediction.stringValue;
    } else {
        console.warn("Could not extract 'generated_text' or stringValue from MedGemma prediction:", JSON.stringify(prediction));
        // Fallback: try to stringify the whole prediction if text extraction fails
        generatedText = JSON.stringify(prediction);
    }

    console.log("MedGemma response received.");
    return { responseText: generatedText };

  } catch (error) {
    console.error('Error calling MedGemma Vertex AI endpoint:', error.details || error.message || error);
    throw new functions.https.HttpsError('internal', 'Failed to invoke MedGemma model.', error.message);
  }
});

// Daily Proactive Coaching (Automated Scheduling)
exports.dailyStudyCoach = functions.pubsub.schedule('every day 07:00').onRun(async (context) => {
  console.log('Daily Study Coach Triggered');
  
  try {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    // We connect Genkit/Vertex for the packet generation
    const { GoogleGenAI } = require("@google/genai");
    const aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Standard Server Init
    
    const batch = db.batch();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Query "Pending" tasks for today
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      const tasksSnapshot = await db.collection(`users/${userId}/tasks`)
        .where('isCompleted', '==', false)
        .where('dueDate', '<=', today)
        .where('status', '==', 'Pending')
        .limit(1)
        .get();
        
      if (tasksSnapshot.empty) continue;
      
      const taskDoc = tasksSnapshot.docs[0];
      const taskData = taskDoc.data();

      console.log(`Generating study packet for User ${userId}, Topic: ${taskData.title}`);

      // Grounding via MCP (simulated here via prompt strictness prior to MCP server connection)
      const prompt = `Act as an expert Medical Professor. Generate a comprehensive daily study packet for the medical topic: "${taskData.title}".
      You MUST strictly format the output with these exact headings:
      - Definition
      - Etiology
      - Clinical Features
      - Investigations
      - Management
      - Flowcharts (Describe textually)
      - High-yield points
      
      Ensure you cite authoritative clinical guidelines where appropriate.`;

      const aiResponse = await aiInstance.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      
      if (aiResponse.text) {
          // Push notification/packet document directly to dashboard
          const packetRef = db.collection(`users/${userId}/studyPackets`).doc();
          batch.set(packetRef, {
             taskId: taskDoc.id,
             topic: taskData.title,
             content: aiResponse.text,
             generatedAt: admin.firestore.FieldValue.serverTimestamp(),
             isRead: false
          });
          
          // Mark task as generated to avoid duplicates
          batch.update(taskDoc.ref, { status: "PacketGenerated", packetId: packetRef.id });
      }
    }
    
    await batch.commit();
    console.log('Daily Study Packets successfully generated and queued.');

  } catch (error) {
     console.error("Daily Study Coach cron failed:", error);
  }
  
  return null;
});
exports.searchYouTubeVideos = functions.https.onCall(async (data, context) => {
  const query = data.query;
  const apiKey = functions.config().youtube ? functions.config().youtube.key : null;

  if (!apiKey) {
    console.error("YouTube API key not configured in Firebase Functions config.");
    throw new functions.https.HttpsError('failed-precondition', 'API key for YouTube service not configured.');
  }

  if (!query) {
    throw new functions.https.HttpsError('invalid-argument', 'Search query is required.');
  }

  try {
    const response = await fetchWithRetry('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} medical lecture`,
        key: apiKey,
        type: 'video',
        maxResults: 12,
        relevanceLanguage: 'en',
        safeSearch: 'moderate',
        videoCategoryId: '27', // Education Category
      },
    });
    
    // Defensive check for unexpected successful response structure
    if (!response.data || !Array.isArray(response.data.items)) {
        console.warn('YouTube API returned a successful response but the items array is missing or not an array.', response.data);
        return { videos: [] }; // Return an empty array to prevent crashes.
    }
    
    // Filter for items that are definitely videos and have necessary data
    const videos = response.data.items
      .filter(item => item && item.id && item.id.videoId && item.snippet)
      .map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        channel: item.snippet.channelTitle,
    }));
    
    return { videos };

  } catch (error) {
    throwHttpsErrorFromApi(error, 'YouTube Data API');
  }
});
