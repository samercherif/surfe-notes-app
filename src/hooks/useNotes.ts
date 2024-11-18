import { useState, useEffect } from 'react';
import type { Note, NotesResponse } from '@src/types/note';
import { useClients } from '@api/ApiClientContext';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiClient } = useClients();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get<Note[]>('/notes');
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes. Please try again later.');
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return { notes, isLoading, error, refetchNotes: fetchNotes };
};