
// src/hooks/use-ai-agent.ts
"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

type AgentFunction<T, R> = (input: T) => Promise<R>;

interface UseAiAgentResult<T, R> {
  execute: (input: T) => Promise<void>;
  data: R | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * A robust hook for interacting with Genkit AI agent functions.
 * It handles loading states, errors, and parsing of AI-generated JSON.
 *
 * @param agentFunction The server action (AI agent) to call.
 * @param schema The Zod schema to validate the AI's output.
 * @param options Optional callbacks and messages.
 */
export function useAiAgent<T, R>(
  agentFunction: AgentFunction<T, R>,
  schema?: z.ZodType<R>, // Schema is now optional for functions that don't need parsing
  options?: {
    onSuccess?: (data: R, input: T) => void;
    onError?: (error: string) => void;
    successMessage?: string;
  }
): UseAiAgentResult<T, R> {
  const [data, setData] = useState<R | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const parseJsonResponse = (response: any): R | null => {
    // If no schema is provided, return the response as is.
    if (!schema) {
      return response as R;
    }

    if (response && typeof response === 'object') {
        const parsed = schema.safeParse(response);
        if (parsed.success) return parsed.data;
    }
    
    console.error("Zod validation failed or response is not a direct object. Response:", response);
    setError("An unexpected response format was received from the server.");
    return null;
  };

  const execute = useCallback(async (input: T) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await agentFunction(input);
      const parsedData = parseJsonResponse(result);

      if (parsedData) {
        setData(parsedData);
        if (options?.onSuccess) {
          options.onSuccess(parsedData, input);
        } else if (options?.successMessage) {
          toast({
            title: "Success!",
            description: options.successMessage,
          });
        }
      } else {
         const currentError = "An unexpected response format was received from the server.";
         setError(currentError);
         if (options?.onError) {
            options.onError(currentError);
         } else {
            toast({ title: "Error", description: currentError, variant: 'destructive' });
         }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      if (options?.onError) {
        options.onError(errorMessage);
      } else {
        toast({
          title: "An Error Occurred",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [agentFunction, schema, options, toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, data, isLoading, error, reset };
}
