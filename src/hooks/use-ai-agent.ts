"use client";

import { useState } from 'react';

export function useAiAgent() {
  const [isLoading, setIsLoading] = useState(false);

  const callAgent = async (endpoint: string, payload: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } finally {
      setIsLoading(false);
    }
  };

  return { callAgent, isLoading };
}
