"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { storage, firestore as db } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';

export function useVibeLecture(uid: string, sessionId: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveDraft, setLiveDraft] = useState('');
  const [verifiedChunks, setVerifiedChunks] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const masterAudioBlobs = useRef<Blob[]>([]); 
  const currentChunkBlobs = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const isManuallyStopped = useRef(false);

  useEffect(() => {
    if (!uid || !sessionId) return;
    const sessionRef = doc(db, 'users', uid, 'lectureSessions', sessionId);
    const unsubscribeSession = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        setSessionData(snapshot.data());
      }
    });

    const chunksRef = collection(db, 'users', uid, 'lectureSessions', sessionId, 'chunks');
    const q = query(chunksRef, orderBy('timestamp', 'asc'));
    const unsubscribeChunks = onSnapshot(q, (snapshot) => {
      setVerifiedChunks(snapshot.docs.map(doc => doc.data()));
    });
    return () => {
      unsubscribeSession();
      unsubscribeChunks();
    };
  }, [uid, sessionId]);

  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript + ' ';
        }
      }
      if (final) {
        setLiveDraft(prev => (prev + ' ' + final).trim());
      }
    };

    recognition.onend = () => {
      if (!isManuallyStopped.current && isRecording) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart speech recognition:", e);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed') {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
  }, [isRecording]);

  const uploadChunk = useCallback(async (blobs: Blob[]) => {
    if (blobs.length === 0) return;
    const chunkBlob = new Blob(blobs, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', chunkBlob);
    formData.append('uid', uid);
    formData.append('sessionId', sessionId);

    try {
      await fetch('/api/lecture/vibe-chunk', { 
        method: 'POST', 
        body: formData 
      });
    } catch (err) {
      console.error("Chunk upload failed:", err);
    }
  }, [uid, sessionId]);

  const startLecture = useCallback(async () => {
    isManuallyStopped.current = false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    initRecognition();
    recognitionRef.current?.start();

    // Setup MediaRecorder for local memory push + chunked processing
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = recorder;

    let sliceCount = 0;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        // ALWAYS push to local memory array (The Audio Vault)
        masterAudioBlobs.current.push(event.data); 
        currentChunkBlobs.current.push(event.data);
        
        sliceCount++;
        // If 6 minutes has passed (6 mins / 10s = 36 slices)
        if (sliceCount >= 36) {
          uploadChunk([...currentChunkBlobs.current]);
          currentChunkBlobs.current = [];
          sliceCount = 0;
        }
      }
    };

    recorder.start(10000); // 10s chunks for local memory safety
    setIsRecording(true);
  }, [uid, sessionId, initRecognition, uploadChunk]);

  const endLecture = useCallback(async () => {
    isManuallyStopped.current = true;
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();

    // Upload the final remaining chunk if any
    if (currentChunkBlobs.current.length > 0) {
      await uploadChunk([...currentChunkBlobs.current]);
      currentChunkBlobs.current = [];
    }

    setIsRecording(false);
    
    // LAYER 3: The Master Pass
    if (masterAudioBlobs.current.length > 0) {
      const masterBlob = new Blob(masterAudioBlobs.current, { type: 'audio/webm' });
      
      // OPTIONAL: Still upload to storage for redundancy, but prompt implies we send directly to VibeVoice
      const fileRef = ref(storage, `lectures/${uid}/${sessionId}/master_audio.webm`);
      await uploadBytes(fileRef, masterBlob);

      // Trigger the Master Pass Synthesis
      await fetch('/api/lecture/vibe-finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, sessionId })
      });
    }
  }, [uid, sessionId, uploadChunk]);

  const downloadAudio = useCallback(() => {
    if (masterAudioBlobs.current.length === 0) return;
    const blob = new Blob(masterAudioBlobs.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VibeVoice_Lecture_${new Date().toISOString().split('T')[0]}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, []);

  return { 
    startLecture, 
    endLecture, 
    isRecording, 
    liveDraft, 
    verifiedChunks, 
    sessionData,
    downloadAudio 
  };
}
