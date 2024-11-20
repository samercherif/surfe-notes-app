/* eslint-disable max-len */
import { renderHook, waitFor } from '@testing-library/react'
import { useNotes } from '@hooks/useNotes'
import type { Note } from '@src/types/note'
import { ApiClientProvider } from '@api/ApiClientContext'
import axios from 'axios'
import type { ReactNode } from 'react'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
}))

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

const mockNotes: Note[] = [
  {
    id: '1',
    body: 'Test Note 1',
  },
  {
    id: '2',
    body: 'Test Content 2',
  },
]

const wrapper = ({ children }: { children: ReactNode }) => <ApiClientProvider>{children}</ApiClientProvider>

describe('useNotes Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.notes).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should fetch notes successfully', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      data: mockNotes,
    })
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.notes).toEqual(mockNotes)
    expect(result.current.error).toBeNull()
    expect(mockGet).toHaveBeenCalledWith('/notes')
  })

  it('should handle API error', async () => {
    const mockError = new Error('Failed to fetch notes')
    const mockGet = jest.fn().mockRejectedValue(mockError)
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch notes. Please try again later.')
    expect(result.current.notes).toEqual([])
    expect(console.error).toHaveBeenCalledWith('Error fetching notes:', mockError)
  })

  it('should refetch notes when refetchNotes is called', async () => {
    const mockGet = jest
      .fn()
      .mockResolvedValueOnce({ data: mockNotes })
      .mockResolvedValueOnce({
        data: [
          ...mockNotes,
          {
            id: '3',
            body: 'Test Content 3',
          },
        ],
      })
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes)
    })

    result.current.refetchNotes()

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(3)
    })

    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('should handle empty notes array', async () => {
    const mockGet = jest.fn().mockResolvedValue({ data: [] })
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.notes).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should maintain loading state while fetching', async () => {
    const mockGet = jest
      .fn()
      .mockImplementation(async () => new Promise((resolve) => setTimeout(() => resolve({ data: mockNotes }), 100)))
    ;(axios.create as jest.Mock).mockReturnValue({ get: mockGet })

    const { result } = renderHook(() => useNotes(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.notes).toEqual(mockNotes)
  })
})
