import { useState, useCallback, useEffect, useRef } from 'react'
import { useClients } from '@api/ApiClientContext'

export interface User {
  first_name: string
  username: string
  birthdate: number
}

const MENTION_REGEX = /(?:^|\s)@([\w-]*)$/
const MAX_RESULTS = 5

export const useUserSearch = (text: string, cursorPosition: number) => {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { usersClient } = useClients()
  const usersCache = useRef<User[]>([])

  const fetchUsers = useCallback(async () => {
    if (usersCache.current.length > 0) return

    try {
      setIsLoading(true)
      setError(null)
      const { data } = await usersClient.get<User[]>('')
      usersCache.current = data
      setAllUsers(data)
    } catch (err) {
      setError('Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [usersClient])

  const getMentionSearchTerm = useCallback((text: string, cursorPosition: number) => {
    const textBeforeCursor = text.slice(0, cursorPosition)
    const match = textBeforeCursor.match(MENTION_REGEX)
    return match ? match[1] : null
  }, [])

  //relevance score for sorting
  const calculateRelevance = (user: User, query: string) => {
    const lowercaseQuery = query.toLowerCase()
    let score = 0

    //exact matches at start
    if (user.username.toLowerCase().startsWith(lowercaseQuery)) score += 10
    if (user.first_name.toLowerCase().startsWith(lowercaseQuery)) score += 8

    //partial matches
    if (user.username.toLowerCase().includes(lowercaseQuery)) score += 5
    if (user.first_name.toLowerCase().includes(lowercaseQuery)) score += 4

    //consecutive character matches
    let consecutiveMatches = 0
    const usernameLower = user.username.toLowerCase()
    let lastMatchIndex = -1

    for (let i = 0; i < lowercaseQuery.length; i++) {
      const char = lowercaseQuery[i]
      const index = usernameLower.indexOf(char, lastMatchIndex + 1)

      if (index > lastMatchIndex) {
        if (index === lastMatchIndex + 1) {
          consecutiveMatches++
          score += consecutiveMatches * 2
        } else {
          consecutiveMatches = 0
        }
        lastMatchIndex = index
      }
    }

    return score
  }

  const filterUsers = useCallback(
    (query: string) => {
      if (!query) {
        setFilteredUsers([])
        return
      }

      const lowercaseQuery = query.toLowerCase()
      const filtered = allUsers
        .filter(
          (user) =>
            user.username.toLowerCase().includes(lowercaseQuery) ||
            user.first_name.toLowerCase().includes(lowercaseQuery),
        )
        .map((user) => ({
          ...user,
          relevance: calculateRelevance(user, query),
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, MAX_RESULTS)
        .map(({ ...user }) => user)

      setFilteredUsers(filtered)
    },
    [allUsers],
  )

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const newSearchTerm = getMentionSearchTerm(text, cursorPosition)
    setSearchTerm(newSearchTerm)

    if (newSearchTerm !== null) {
      filterUsers(newSearchTerm)
    } else {
      setFilteredUsers([])
    }
  }, [text, cursorPosition, getMentionSearchTerm, filterUsers])

  return {
    searchTerm,
    users: filteredUsers,
    isLoading: isLoading && searchTerm !== null,
    error,
  }
}
