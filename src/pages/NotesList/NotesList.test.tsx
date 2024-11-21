import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useNotes } from '@hooks/useNotes'
import { useNavigate } from 'react-router-dom'
import { useClients } from '@api/ApiClientContext'
import type { Note } from '@src/types/note'
import NotesList from './NotesList'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
}))

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}))

jest.mock('@hooks/useNotes')
const mockUseNotes = useNotes as jest.MockedFunction<typeof useNotes>

jest.mock('@api/ApiClientContext')
const mockUseClients = useClients as jest.MockedFunction<typeof useClients>

jest.mock('@components/NoteCard/NoteCard', () => {
  return function MockNoteCard({ note, onClick }: { note: Note; onClick: (note: Note) => void }) {
    return (
      <div data-testid={`note-card-${note.id}`} onClick={() => onClick(note)}>
        {note.body}
      </div>
    )
  }
})

describe('NotesList', () => {
  const mockNavigate = jest.fn()
  const mockFetchNotes = jest.fn()
  const mockPost = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    mockUseClients.mockReturnValue({
      apiClient: {
        post: mockPost,
      },
    } as any)
  })

  const renderWithMocks = (options = {}) => {
    const defaultProps = {
      notes: [],
      isLoading: false,
      error: null,
      fetchNotes: mockFetchNotes,
      ...options,
    }

    mockUseNotes.mockReturnValue(defaultProps as any)
    return render(<NotesList />)
  }

  it('should fetch notes on mount', () => {
    renderWithMocks()
    expect(mockFetchNotes).toHaveBeenCalled()
  })

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch notes'
    renderWithMocks({ error: errorMessage })

    expect(screen.getByText('My Notes')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toHaveClass('notes-error')
  })

  it('renders empty state correctly', () => {
    renderWithMocks()

    expect(screen.getByText('My Notes')).toBeInTheDocument()
    expect(screen.getByText('No notes found. Create your first note!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new note/i })).toBeInTheDocument()
  })

  it('renders notes list correctly', () => {
    const mockNotes: Note[] = [
      { id: 1, body: 'Test Note 1' },
      { id: 2, body: 'Test Note 2' },
      { id: 3, body: 'Test Note 3' },
    ]

    renderWithMocks({ notes: mockNotes })

    expect(screen.getByText('My Notes')).toBeInTheDocument()
    mockNotes.forEach((note) => {
      expect(screen.getByTestId(`note-card-${note.id}`)).toBeInTheDocument()
      expect(screen.getByText(note.body)).toBeInTheDocument()
    })
  })

  it('navigates to note when clicked', () => {
    const mockNotes = [{ id: '1', body: 'Test Note 1' }]
    renderWithMocks({ notes: mockNotes })

    fireEvent.click(screen.getByTestId('note-card-1'))
    expect(mockNavigate).toHaveBeenCalledWith('/notes/1')
  })

  it('creates new note when create button is clicked', async () => {
    const newNote = { id: '123', body: ' ' }
    mockPost.mockResolvedValueOnce({ data: newNote })

    renderWithMocks()

    const createButton = screen.getByRole('button', { name: /new note/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/notes', { body: ' ' })
      expect(mockNavigate).toHaveBeenCalledWith('/notes/123')
    })
  })

  it('handles create note error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockPost.mockRejectedValueOnce(new Error('Failed to create note'))

    renderWithMocks()

    const createButton = screen.getByRole('button', { name: /new note/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create note:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('applies correct CSS classes', () => {
    const mockNotes = [
      { id: '1', body: 'Test Note 1' },
      { id: '2', body: 'Test Note 2' },
    ]

    renderWithMocks({ notes: mockNotes })

    expect(screen.getByText('My Notes')).toHaveClass('notes-title')
    expect(screen.getByTestId('notes-container')).toHaveClass('notes-container')
    expect(screen.getByTestId('notes-grid')).toHaveClass('notes-grid')
  })

  it('renders create button with plus icon', () => {
    renderWithMocks()

    const createButton = screen.getByRole('button', { name: /new note/i })
    expect(createButton).toBeInTheDocument()
    expect(createButton.querySelector('svg')).toBeInTheDocument() // Check for icon
  })
})
