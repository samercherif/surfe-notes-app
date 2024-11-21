import { renderHook, waitFor } from '@testing-library/react'
import { useClients } from '@api/ApiClientContext'
import type { User } from './useSearchUser'
import { useUserSearch } from './useSearchUser'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
  VITE_APP_SURFE_USERS_API_URL: 'usersUrl',
}))

jest.mock('@api/ApiClientContext')
const mockUseClients = useClients as jest.MockedFunction<typeof useClients>

describe('useUserSearch', () => {
  const mockGet = jest.fn()
  const mockUsers: User[] = [
    { first_name: 'John', username: 'johndoe', birthdate: 123456789 },
    { first_name: 'Jane', username: 'janesmith', birthdate: 123456790 },
    { first_name: 'James', username: 'jamesjohnson', birthdate: 123456791 },
    { first_name: 'Sarah', username: 'sarahw', birthdate: 123456792 },
    { first_name: 'Mike', username: 'mikej', birthdate: 123456793 },
    { first_name: 'John', username: 'johnsmith', birthdate: 123456794 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({ data: mockUsers })
    mockUseClients.mockReturnValue({
      usersClient: { get: mockGet },
    } as any)
  })

  it('fetches all users only once', async () => {
    const { rerender } = renderHook(() => useUserSearch('Hello @john', 10))

    rerender()
    expect(mockGet).toHaveBeenCalledTimes(1)
  })

  it('returns null searchTerm when no @ symbol is present', async () => {
    const { result } = renderHook(() => useUserSearch('Hello world', 5))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.searchTerm).toBeNull()
    expect(result.current.users).toHaveLength(0)
  })

  it('filters users by username and name', async () => {
    const { result } = renderHook(() => useUserSearch('Hello @john', 10))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.users.map((u: { username: string }) => u.username)).toEqual(
      expect.arrayContaining(['johndoe', 'johnsmith']),
    )
  })

  it('limits results to 5 users', async () => {
    const { result } = renderHook(() => useUserSearch('Hello @j', 8))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.users.length).toBeLessThanOrEqual(5)
  })

  it('handles API errors', async () => {
    mockGet.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useUserSearch('Hello @john', 10))

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch users')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('sorts users by relevance - exact username match first', async () => {
    const { result } = renderHook(() => useUserSearch('Hello @johndoe', 13))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.users).toHaveLength(1)
      expect(result.current.users[0].username).toBe('johndoe')
    })
  })

  it('sorts users by relevance - partial matches', async () => {
    const { result } = renderHook(() => useUserSearch('Hello @john', 10))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.users.length).toBeGreaterThan(0)

      const usernames = result.current.users.map((u) => u.username)
      expect(usernames[0]).toMatch(/^john/)
      expect(usernames).toContain('jamesjohnson')

      const johnsonIndex = usernames.indexOf('jamesjohnson')
      expect(johnsonIndex).toBeGreaterThan(0)
    })
  })

  it('handles consecutive character matches in relevance scoring', async () => {
    const { result } = renderHook(() => useUserSearch('Hello @joh', 9))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.users.length).toBeGreaterThan(0)

      const usernames = result.current.users.map((u) => u.username)
      expect(usernames[0]).toMatch(/^joh/)
    })
  })

  it('returns empty results for empty search term', async () => {
    const { result } = renderHook(() => useUserSearch('Hello @ ', 7))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.users).toHaveLength(0)
    })
  })

  it('handles cursor position correctly', async () => {
    const { result, rerender } = renderHook(({ text, position }) => useUserSearch(text, position), {
      initialProps: { text: 'Hello @john and @jane', position: 10 },
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.searchTerm).toBe('joh')
    })

    rerender({ text: 'Hello @john and @jane', position: 20 })
    expect(result.current.searchTerm).toBe('jan')
  })
})
