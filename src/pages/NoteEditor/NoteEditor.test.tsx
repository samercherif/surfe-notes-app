import { render, screen, fireEvent, act } from '@testing-library/react'
import { useParams } from 'react-router-dom'
import { useAutoSaveNote } from '@hooks/UseAutoSaveNote'
import { useUserSearch } from '@hooks/useSearchUser'
import { EDITOR } from './constants'
import NoteEditor from './NoteEditor'

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}))

jest.mock('@hooks/UseAutoSaveNote')
jest.mock('@hooks/useSearchUser')

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
  VITE_APP_SURFE_USERS_API_URL: 'usersUrl',
}))

describe('NoteEditor', () => {
  const mockSetContent = jest.fn()
  const mockUsers = [
    { first_name: 'John', username: 'johndoe', birthdate: 123456789 },
    { first_name: 'Jane', username: 'janesmith', birthdate: 123456790 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(useParams as jest.Mock).mockReturnValue({ id: '123' })

    const mockUseAutoSaveNote = useAutoSaveNote as jest.MockedFunction<typeof useAutoSaveNote>
    mockUseAutoSaveNote.mockReturnValue({
      content: '',
      setContent: mockSetContent,
      isSaving: false,
      lastSavedAt: null,
    })

    const mockUseUserSearch = useUserSearch as jest.MockedFunction<typeof useUserSearch>
    mockUseUserSearch.mockReturnValue({
      searchTerm: null,
      users: [],
      isLoading: false,
      error: null,
    })

    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 100,
      left: 100,
      width: EDITOR.WIDTH,
      height: EDITOR.MIN_HEIGHT,
    })

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('renders textarea with correct attributes', () => {
      render(<NoteEditor />)

      const textarea = screen.getByRole('textbox', { name: 'Note content' })
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('placeholder', 'Start writing your note...')
      expect(textarea).toHaveClass('note-textarea')
    })

    it('renders with autofocus', () => {
      render(<NoteEditor />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveFocus()
    })

    it('displays saving status when isSaving is true', () => {
      const mockUseAutoSaveNote = useAutoSaveNote as jest.MockedFunction<typeof useAutoSaveNote>
      mockUseAutoSaveNote.mockReturnValue({
        content: '',
        setContent: mockSetContent,
        isSaving: true,
        lastSavedAt: null,
      })

      render(<NoteEditor />)

      expect(screen.getByText('Saving changes...')).toBeInTheDocument()
      expect(screen.getByTestId('status-dot')).toHaveClass('note-status-dot-saving')
    })

    it('displays saved status with timestamp', () => {
      const mockUseAutoSaveNote = useAutoSaveNote as jest.MockedFunction<typeof useAutoSaveNote>
      mockUseAutoSaveNote.mockReturnValue({
        content: '',
        setContent: mockSetContent,
        isSaving: false,
        lastSavedAt: new Date(),
      })

      render(<NoteEditor />)

      expect(screen.getByText('All changes saved!')).toBeInTheDocument()
      expect(screen.getByTestId('status-dot')).toHaveClass('note-status-dot-saved')
    })
  })

  describe('Text Editing', () => {
    it('updates content on text change', async () => {
      render(<NoteEditor />)

      const textarea = screen.getByRole('textbox')

      act(() => {
        fireEvent.change(textarea, { target: { value: 'Hello world' } })
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockSetContent).toHaveBeenCalledWith('Hello world')
    })

    it('maintains cursor position on text change', () => {
      const mockUseAutoSaveNote = useAutoSaveNote as jest.MockedFunction<typeof useAutoSaveNote>
      mockUseAutoSaveNote.mockReturnValue({
        content: 'Hello',
        setContent: mockSetContent,
        isSaving: false,
        lastSavedAt: null,
      })

      render(<NoteEditor />)
      const textarea = screen.getByRole('textbox')

      Object.defineProperty(textarea, 'selectionStart', {
        value: 5,
        configurable: true,
      })

      fireEvent.select(textarea)
      expect(textarea.selectionStart).toBe(5)
    })
  })

  describe('Mentions Functionality', () => {
    beforeEach(() => {
      const mockUseUserSearch = useUserSearch as jest.MockedFunction<typeof useUserSearch>
      mockUseUserSearch.mockReturnValue({
        searchTerm: 'j',
        users: mockUsers,
        isLoading: false,
        error: null,
      })
    })

    it('shows mention list when typing @', () => {
      render(<NoteEditor />)

      const textarea = screen.getByRole('textbox')

      act(() => {
        fireEvent.change(textarea, { target: { value: '@j' } })
        // Mock selection position
        Object.defineProperty(textarea, 'selectionStart', {
          value: 2,
          configurable: true,
        })
        fireEvent.select(textarea)
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getAllByRole('option')).toHaveLength(mockUsers.length)
    })

    it('navigates mention list with arrow keys', () => {
      render(<NoteEditor />)

      const textarea = screen.getByRole('textbox')

      act(() => {
        fireEvent.change(textarea, { target: { value: '@j' } })
        Object.defineProperty(textarea, 'selectionStart', {
          value: 2,
          configurable: true,
        })
        fireEvent.select(textarea)
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      fireEvent.keyDown(textarea, { key: 'ArrowDown' })
      expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')

      fireEvent.keyDown(textarea, { key: 'ArrowUp' })
      expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('inserts mention on Enter key', () => {
      render(<NoteEditor />)

      const textarea = screen.getByRole('textbox')

      act(() => {
        fireEvent.change(textarea, { target: { value: '@j' } })
        Object.defineProperty(textarea, 'selectionStart', {
          value: 2,
          configurable: true,
        })
        fireEvent.select(textarea)
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(mockSetContent).toHaveBeenCalledWith('@johndoe ')
    })
  })
})
