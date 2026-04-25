"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { storage, firestore as db } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export function useVibeLecture(uid: string, sessionId: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveDraft, setLiveDraft] = useState('');
  const [verifiedChunks, setVerifiedChunks] = useState<any[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const masterAudioBlobs = useRef<Blob[]>([]); 
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!uid || !sessionId) return;
    const chunksRef = collection(db, 'users', uid, 'lectureSessions', sessionId, 'chunks');
    const q = query(chunksRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVerifiedChunks(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [uid, sessionId]);

  const startLecture = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (e: any) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          interim += e.results[i][0].transcript;
        }
        setLiveDraft(interim);
      };
      recognitionRef.current.start();
    }

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        masterAudioBlobs.current.push(event.data); 
        const formData = new FormData();
        formData.append('audio', event.data);
        formData.append('uid', uid);
        formData.append('sessionId', sessionId);
        fetch('/api/lecture/vibe-chunk', { method: 'POST', body: formData }).catch(console.error);
      }
    };

    mediaRecorderRef.current.start(360000); // 6 mins
    setIsRecording(true);
  }, [uid, sessionId]);

  const endLecture = useCallback(async () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
    
    if (masterAudioBlobs.current.length > 0) {
      const masterBlob = new Blob(masterAudioBlobs.current, { type: 'audio/webm' });
      const fileRef = ref(storage, `lectures/${uid}/${sessionId}/master_audio.webm`);
      await uploadBytes(fileRef, masterBlob);
      fetch('/api/lecture/vibe-finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, sessionId })
      }).catch(console.error);
    }
  }, [uid, sessionId]);

  const downloadAudio = useCallback(() => {
    if (masterAudioBlobs.current.length === 0) return;
    const url = URL.createObjectURL(new Blob(masterAudioBlobs.current, { type: 'audio/webm' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lecture_${sessionId}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [sessionId]);

  return { startLecture, endLecture, isRecording, liveDraft, verifiedChunks, downloadAudio };
}
