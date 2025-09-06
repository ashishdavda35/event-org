'use client';

import React, { createContext, useContext, useState } from 'react';
import { Poll, PollResponse, PollContextType } from '@/types';
import api from '@/lib/api';

const PollContext = createContext<PollContextType | undefined>(undefined);

export const usePoll = () => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(false);

  const joinPoll = async (code: string, participantName: string, participantEmail?: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/polls/join/${code}`, {
        participantName,
        participantEmail
      });
      
      const { poll } = response.data;
      setCurrentPoll(poll);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to join poll');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (response: PollResponse, pollCode?: string) => {
    const code = pollCode || currentPoll?.code;
    if (!code) throw new Error('No poll code provided');
    
    console.log('PollContext: Submitting response to:', `/polls/${code}/respond`);
    console.log('PollContext: Response data:', response);
    
    setLoading(true);
    try {
      const result = await api.post(`/polls/${code}/respond`, response);
      console.log('PollContext: Submit successful:', result.data);
    } catch (error: any) {
      console.error('PollContext: Submit error:', error);
      console.error('PollContext: Error response:', error.response?.data);
      console.error('PollContext: Error status:', error.response?.status);
      console.error('PollContext: Error headers:', error.response?.headers);
      console.error('PollContext: Request data:', response);
      throw new Error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  const value: PollContextType = {
    currentPoll,
    setCurrentPoll,
    joinPoll,
    submitResponse,
    loading
  };

  return (
    <PollContext.Provider value={value}>
      {children}
    </PollContext.Provider>
  );
};
