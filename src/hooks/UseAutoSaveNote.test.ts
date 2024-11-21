import { renderHook, act } from '@testing-library/react'
import { useNotes } from '@hooks/useNotes'
import { useAutoSaveNote } from './UseAutoSaveNote'

jest.mock('@hooks/useNotes')
jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
  VITE_APP_SURFE_USERS_API_URL: 'usersUrl',
}))
const mockUseNotes = useNotes as jest.MockedFunction<typeof useNotes>

describe('useAutoSaveNote', () => {
  const mockFetchNoteById = jest.fn()
  const mockUpdateNote = jest.fn()
  const noteId = '1'
  const mockNote = { id: noteId, body: 'Initial content' }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockUseNotes.mockReturnValue({
      note: mockNote,
      updateNote: mockUpdateNote,
      fetchNoteById: mockFetchNoteById,
    } as any)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('fetches note on mount', () => {
    renderHook(() => useAutoSaveNote(noteId))
    expect(mockFetchNoteById).toHaveBeenCalledWith(1)
  })

  it('loads initial content from note', () => {
    const { result } = renderHook(() => useAutoSaveNote(noteId))
    expect(result.current.content).toBe('Initial content')
  })

  it('starts with empty content when note not found', () => {
    mockUseNotes.mockReturnValue({
      note: undefined,
      updateNote: mockUpdateNote,
      fetchNoteById: mockFetchNoteById,
    } as any)

    const { result } = renderHook(() => useAutoSaveNote(noteId))
    expect(result.current.content).toBe('')
  })

  it('updates content when note changes', () => {
    const { result, rerender } = renderHook(() => useAutoSaveNote(noteId))

    mockUseNotes.mockReturnValue({
      note: { id: noteId, body: 'Updated content' },
      updateNote: mockUpdateNote,
      fetchNoteById: mockFetchNoteById,
    } as any)

    rerender()
    expect(result.current.content).toBe('Updated content')
  })

  it('saves content after delay', async () => {
    mockUpdateNote.mockResolvedValueOnce({ id: noteId, body: 'New content' })
    const { result } = renderHook(() => useAutoSaveNote(noteId))

    act(() => {
      result.current.setContent('New content')
    })

    expect(result.current.content).toBe('New content')
    expect(result.current.isSaving).toBe(false)

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockUpdateNote).toHaveBeenCalledWith({
      id: 1,
      body: 'New content',
    })
  })

  it('shows saving state while saving', async () => {
    let resolvePromise: (value: unknown) => void
    const savePromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockUpdateNote.mockReturnValueOnce(savePromise)

    const { result } = renderHook(() => useAutoSaveNote(noteId))

    act(() => {
      result.current.setContent('New content')
    })

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.isSaving).toBe(true)

    await act(async () => {
      resolvePromise!({})
    })

    expect(result.current.isSaving).toBe(false)
  })

  it('updates lastSavedAt after successful save', async () => {
    mockUpdateNote.mockResolvedValueOnce({ id: noteId, body: 'New content' })
    const { result } = renderHook(() => useAutoSaveNote(noteId))

    act(() => {
      result.current.setContent('New content')
    })

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.lastSavedAt).toBeInstanceOf(Date)
  })

  it('handles multiple rapid changes', async () => {
    mockUpdateNote.mockResolvedValueOnce({ id: noteId, body: 'Final content' })
    const { result } = renderHook(() => useAutoSaveNote(noteId))

    act(() => {
      result.current.setContent('First change')
      result.current.setContent('Second change')
      result.current.setContent('Final content')
    })

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockUpdateNote).toHaveBeenCalledTimes(1)
    expect(mockUpdateNote).toHaveBeenCalledWith({
      id: 1,
      body: 'Final content',
    })
  })

  it('does not save if content matches current note', async () => {
    const { result } = renderHook(() => useAutoSaveNote(noteId))

    act(() => {
      result.current.setContent('Initial content')
    })

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockUpdateNote).not.toHaveBeenCalled()
  })

  it('handles save error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Save failed')
    mockUpdateNote.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAutoSaveNote(noteId))

    act(() => {
      result.current.setContent('New content')
    })

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save note:', error)
    expect(result.current.isSaving).toBe(false)

    consoleErrorSpy.mockRestore()
  })

  it('cleans up timeout on unmount', () => {
    const { unmount } = renderHook(() => useAutoSaveNote(noteId))

    act(() => {
      unmount()
    })

    jest.advanceTimersByTime(1000)
    expect(mockUpdateNote).not.toHaveBeenCalled()
  })
})
