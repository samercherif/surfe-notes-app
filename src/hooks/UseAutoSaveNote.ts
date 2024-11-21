import { useState, useEffect, useCallback } from 'react'
import { useNotes } from '@hooks/useNotes'

export const useAutoSaveNote = (noteId: string) => {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const { note, updateNote, fetchNoteById } = useNotes()

  useEffect(() => {
    if (noteId) {
      fetchNoteById(+noteId)
    }
  }, [noteId, fetchNoteById])

  useEffect(() => {
    if (note?.body) {
      setContent(note.body)
    }
  }, [note])

  const handleChange = useCallback((newContent: string) => {
    setContent(newContent)
  }, [])

  useEffect(() => {
    if (content === note?.body) return

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true)
        await updateNote({ id: +noteId, body: content })
        setLastSavedAt(new Date())
      } catch (error) {
        console.error('Failed to save note:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [content, noteId, updateNote, note?.body])

  return {
    content,
    setContent: handleChange,
    isSaving,
    lastSavedAt,
  }
}
