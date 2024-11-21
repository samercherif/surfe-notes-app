import { useState, useCallback, useRef } from 'react'
import type { Note } from '@src/types/note'
import { useClients } from '@api/ApiClientContext'

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [note, setNote] = useState<Note>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { apiClient } = useClients()

  // used this ref because React.StrictMode is rendering components twice in development env
  const activeRequests = useRef<Record<string, boolean>>({})

  const fetchNotes = useCallback(async () => {
    const requestKey = 'fetchNotes'
    if (activeRequests.current[requestKey]) return

    try {
      activeRequests.current[requestKey] = true
      setIsLoading(true)
      const { data } = await apiClient.get<Note[]>('/notes')
      setNotes(data)
    } catch (err) {
      setError('Failed to fetch notes. Please try again later.')
      console.error('Error fetching notes:', err)
    } finally {
      setIsLoading(false)
      activeRequests.current[requestKey] = false
    }
  }, [apiClient])

  const fetchNoteById = useCallback(
    async (noteId: number) => {
      const requestKey = `fetchNote_${noteId}`
      if (activeRequests.current[requestKey]) return

      try {
        activeRequests.current[requestKey] = true
        setIsLoading(true)
        const { data } = await apiClient.get<Note>(`/notes/${noteId}`)
        setNote(data)
      } catch (err) {
        setError('Failed to fetch the note. Please try again later.')
        console.error('Error fetching notes:', err)
      } finally {
        setIsLoading(false)
        activeRequests.current[requestKey] = false
      }
    },
    [apiClient],
  )

  const updateNote = useCallback(
    async (updatedNote: Note) => {
      const requestKey = `updateNote_${updatedNote.id}`
      if (activeRequests.current[requestKey]) return

      try {
        activeRequests.current[requestKey] = true
        const { data } = await apiClient.put<Note>(`/notes/${updatedNote.id}`, updatedNote)
        setNotes((prevNotes) => prevNotes.map((note) => (note.id === data.id ? data : note)))
        setNote(data)
        return data
      } catch (err) {
        console.error('Error updating note:', err)
        throw new Error('Failed to update note. Please try again later.')
      } finally {
        activeRequests.current[requestKey] = false
      }
    },
    [apiClient],
  )

  return {
    notes,
    note,
    isLoading,
    error,
    fetchNotes,
    fetchNoteById,
    updateNote,
  }
}
