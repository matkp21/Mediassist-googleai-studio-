"use client";

import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '@/hooks/use-toast';

/**
 * A hook for real-time streaming of AI responses.
 * Follows the "Ask-Rezzy" inspiration for a "Live Tutor" UX.
 */
export function useAiStreaming() {
    const [streamedText, setStreamedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [fullResponse, setFullResponse] = useState('');
    const { toast } = useToast();

    const startStream = useCallback(async (prompt: string, systemInstruction?: string) => {
        setStreamedText('');
        setFullResponse('');
        setIsStreaming(true);

        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) throw new Error("GEMINI_API_KEY is missing from environment.");

            const genAI = new GoogleGenAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction || "You are Medi, an expert medical tutor. Provide structured, clear, and high-yield clinical information."
            });

            const result = await model.generateContentStream(prompt);
            
            let currentText = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                currentText += chunkText;
                setStreamedText(currentText);
            }
            
            setFullResponse(currentText);
        } catch (error) {
            console.error("Streaming Error:", error);
            toast({
                title: "Streaming Failed",
                description: "The live connection to the medical tutor was interrupted.",
                variant: "destructive"
            });
        } finally {
            setIsStreaming(false);
        }
    }, [toast]);

    const resetStream = useCallback(() => {
        setStreamedText('');
        setFullResponse('');
        setIsStreaming(false);
    }, []);

    return { 
        startStream, 
        streamedText, 
        isStreaming, 
        fullResponse, 
        resetStream 
    };
}
