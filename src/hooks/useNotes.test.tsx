import { renderHook, waitFor } from '@testing-library/react'
import { useNotes } from '@hooks/useNotes'
import type { Note } from '@src/types/note'
import { ApiClientProvider } from '@api/ApiClientContext'
import axios from 'axios'
import { act, type ReactNode } from 'react'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
}))

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    put: jest.fn(),
  })),
}))

const mockNotes: Note[] = [
  {
    id: 1,
    body: 'Test Note 1',
  },
  {
    id: 2,
    body: 'Test Content 2',
  },
]

const wrapper = ({ children }: { children: ReactNode }) => (
  <ApiClientProvider>{children}</ApiClientProvider>
)

describe('useNotes Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.notes).toEqual([])
    expect(result.current.note).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  it('should fetch single note successfully', async () => {
    const mockNote = mockNotes[0]
    const mockGet = jest.fn().mockResolvedValue({
      data: mockNote,
    })
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await result.current.fetchNoteById(1)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.note).toEqual(mockNote)
    expect(result.current.error).toBeNull()
    expect(mockGet).toHaveBeenCalledWith('/notes/1')
  })

  it('should handle API error when fetching single note', async () => {
    const mockError = new Error('Failed to fetch note')
    const mockGet = jest.fn().mockRejectedValue(mockError)
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await result.current.fetchNoteById(1)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch the note. Please try again later.')
    expect(result.current.note).toBeUndefined()
    expect(console.error).toHaveBeenCalledWith('Error fetching notes:', mockError)
  })

  it('should update note successfully', async () => {
    const updatedNote = { id: 1, body: 'Updated content' }
    const mockPut = jest.fn().mockResolvedValue({
      data: updatedNote,
    })
    ;(axios.create as jest.Mock).mockReturnValue({ get: jest.fn(), put: mockPut })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await act(async () => {
      result.current.notes = [...mockNotes]
    })

    await result.current.updateNote(updatedNote)

    expect(mockPut).toHaveBeenCalledWith('/notes/1', updatedNote)
  })

  it('should handle API error when updating note', async () => {
    const mockError = new Error('Failed to update note')
    const mockPut = jest.fn().mockRejectedValue(mockError)
    ;(axios.create as jest.Mock).mockReturnValue({ get: jest.fn(), put: mockPut })

    const { result } = renderHook(() => useNotes(), { wrapper })

    try {
      await result.current.updateNote({ id: 1, body: 'Updated content' })
    } catch (error) {
      expect(error).toEqual(new Error('Failed to update note. Please try again later.'))
    }

    expect(console.error).toHaveBeenCalledWith('Error updating note:', mockError)
  })

  it('should prevent duplicate requests', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      data: mockNotes[0],
    })
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await Promise.all([
      result.current.fetchNoteById(1),
      result.current.fetchNoteById(1),
      result.current.fetchNoteById(1),
    ])

    expect(mockGet).toHaveBeenCalledTimes(1)
  })

  it('should allow new request after previous request completes', async () => {
    const mockGet = jest
      .fn()
      .mockResolvedValueOnce({ data: mockNotes[0] })
      .mockResolvedValueOnce({ data: mockNotes[1] })
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await result.current.fetchNoteById(1)
    await waitFor(() => {
      expect(result.current.note).toEqual(mockNotes[0])
    })

    await result.current.fetchNoteById(2)
    await waitFor(() => {
      expect(result.current.note).toEqual(mockNotes[1])
    })

    expect(mockGet).toHaveBeenCalledTimes(2)
  })
})
