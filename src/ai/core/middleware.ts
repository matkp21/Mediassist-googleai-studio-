import type { GenerateRequest, GenerateResponse, Middleware } from 'genkit';

export function tokenRoiTrackerMiddleware(): Middleware {
  return async (req: GenerateRequest, next: (req: GenerateRequest) => Promise<GenerateResponse>) => {
    const startTime = Date.now();
    
    // Execute the LLM call
    const response = await next(req);
    
    const duration = Date.now() - startTime;

    // Extract and log the exact token consumption
    if (response.usage) {
        console.log(`[Token ROI Tracker] Model: ${req.model}`);
        console.log(`[Token ROI Tracker] Input Tokens: ${response.usage.inputTokens}`);
        console.log(`[Token ROI Tracker] Output Tokens: ${response.usage.outputTokens}`);
        console.log(`[Token ROI Tracker] Execution Time: ${duration}ms`);
        // In production, send this to Firebase Crashlytics or Google Cloud Logging
    }

    return response;
  };
}
