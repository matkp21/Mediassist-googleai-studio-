"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNeuralProfile, trackProgress, MedicoProgressTrackerInput } from '@/ai/agents/medico/ProgressTrackerAgent';

/**
 * Hook for managing the user's Neural Adaptive Profile with caching.
 * Aligns with Item 11 (Frontend State Caching) and Item 13 (Weakness Tracking).
 */
export function useNeuralProfile(userId: string) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['neural-profile', userId],
    queryFn: () => fetchNeuralProfile(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  });

  const trackActivityMutation = useMutation({
    mutationFn: (input: MedicoProgressTrackerInput) => trackProgress(input),
    onSuccess: () => {
      // Invalidate the profile to trigger a re-sync after activity
      queryClient.invalidateQueries({ queryKey: ['neural-profile', userId] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    trackActivity: trackActivityMutation.mutate,
    isTracking: trackActivityMutation.isPending,
  };
}
