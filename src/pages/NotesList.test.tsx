import { render, screen, fireEvent } from '@testing-library/react'
import { useNotes } from '@hooks/useNotes'
import type { Note } from '@src/types/note'
import NotesList from './NotesList'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
}))
jest.mock('@hooks/useNotes')
const mockUseNotes = useNotes as jest.MockedFunction<typeof useNotes>

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
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
  })

  it('renders loading state correctly', () => {
    mockUseNotes.mockReturnValue({
      notes: [],
      isLoading: true,
      error: null,
      refetchNotes: jest.fn(),
    })

    render(<NotesList />)

    expect(screen.getByText('My Notes')).toBeInTheDocument()
    expect(screen.getByText('Loading notes...')).toBeInTheDocument()
  })

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch notes'
    mockUseNotes.mockReturnValue({
      notes: [],
      isLoading: false,
      error: errorMessage,
      refetchNotes: jest.fn(),
    })

    render(<NotesList />)

    expect(screen.getByText('My Notes')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toHaveClass('notes-error')
  })

  it('renders empty state correctly', () => {
    mockUseNotes.mockReturnValue({
      notes: [],
      isLoading: false,
      error: null,
      refetchNotes: jest.fn(),
    })

    render(<NotesList />)

    expect(screen.getByText('My Notes')).toBeInTheDocument()
    expect(screen.getByText('No notes found. Create your first note!')).toBeInTheDocument()
  })

  it('renders notes list correctly', () => {
    const mockNotes: Note[] = [
      { id: '1', body: 'Test Note 1' },
      { id: '2', body: 'Test Note 2' },
      { id: '3', body: 'Test Note 3' },
    ]

    mockUseNotes.mockReturnValue({
      notes: mockNotes,
      isLoading: false,
      error: null,
      refetchNotes: jest.fn(),
    })

    render(<NotesList />)

    expect(screen.getByText('My Notes')).toBeInTheDocument()
    mockNotes.forEach((note) => {
      expect(screen.getByTestId(`note-card-${note.id}`)).toBeInTheDocument()
      expect(screen.getByText(note.body)).toBeInTheDocument()
    })
  })

  it('handles note click correctly', () => {
    const mockNotes: Note[] = [{ id: '1', body: 'Test Note 1' }]

    mockUseNotes.mockReturnValue({
      notes: mockNotes,
      isLoading: false,
      error: null,
      refetchNotes: jest.fn(),
    })

    render(<NotesList />)

    fireEvent.click(screen.getByTestId('note-card-1'))
    expect(console.log).toHaveBeenCalledWith('Note clicked:', '1')
  })

  it('applies correct CSS classes', () => {
    const mockNotes: Note[] = [
      { id: '1', body: 'Test Note 1' },
      { id: '2', body: 'Test Note 2' },
    ]

    mockUseNotes.mockReturnValue({
      notes: mockNotes,
      isLoading: false,
      error: null,
      refetchNotes: jest.fn(),
    })

    render(<NotesList />)

    expect(screen.getByText('My Notes')).toHaveClass('notes-title')
    expect(screen.getByTestId('notes-container')).toHaveClass('notes-container')
    expect(screen.getByTestId('notes-grid')).toHaveClass('notes-grid')
  })
})
