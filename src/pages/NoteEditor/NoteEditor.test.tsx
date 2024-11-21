import { render, screen, fireEvent } from '@testing-library/react'
import { useParams } from 'react-router-dom'
import { useAutoSaveNote } from '@hooks/UseAutoSaveNote'
import NoteEditor from './NoteEditor'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
}))

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}))

jest.mock('@hooks/UseAutoSaveNote')
const mockUseAutoSaveNote = useAutoSaveNote as jest.MockedFunction<typeof useAutoSaveNote>

describe('NoteEditor', () => {
  const mockSetContent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ id: '123' })
  })

  const setupComponent = (options = {}) => {
    const defaultProps = {
      content: '',
      setContent: mockSetContent,
      isSaving: false,
      lastSavedAt: null,
      ...options,
    }

    mockUseAutoSaveNote.mockReturnValue(defaultProps)
    return render(<NoteEditor />)
  }

  it('renders textarea with correct attributes', () => {
    setupComponent()

    const textarea = screen.getByRole('textbox', { name: 'Note content' })
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Start writing your note...')
    expect(textarea).toHaveAttribute('spellcheck', 'true')
    expect(textarea).toHaveClass('note-textarea')
  })

  it('shows initial content in textarea', () => {
    setupComponent({ content: 'Initial content' })

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Initial content')
  })

  it('calls setContent when typing', () => {
    setupComponent()

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'New content' } })

    expect(mockSetContent).toHaveBeenCalledWith('New content')
  })

  it('shows saving status when isSaving is true', () => {
    setupComponent({ isSaving: true })

    const status = screen.getByText('Saving changes...')
    const indicator = status.previousElementSibling

    expect(status).toBeInTheDocument()
    expect(indicator).toHaveClass('note-status-dot-saving')
  })

  it('shows saved status when lastSavedAt exists', () => {
    setupComponent({ lastSavedAt: new Date(), isSaving: false })

    const status = screen.getByText('All changes saved!')
    const indicator = status.previousElementSibling

    expect(status).toBeInTheDocument()
    expect(indicator).toHaveClass('note-status-dot-saved')
  })

  it('hides status when neither saving nor lastSavedAt exists', () => {
    setupComponent()

    expect(screen.queryByText('Saving changes...')).not.toBeInTheDocument()
    expect(screen.queryByText('All changes saved!')).not.toBeInTheDocument()
  })

  it('uses empty string as noteId when params.id is undefined', () => {
    ;(useParams as jest.Mock).mockReturnValue({})
    setupComponent()

    expect(mockUseAutoSaveNote).toHaveBeenCalledWith('')
  })

  it('applies correct CSS classes', () => {
    setupComponent()

    expect(screen.getByTestId('note-editor')).toHaveClass('note-editor')
    expect(screen.getByTestId('note-container')).toHaveClass('note-container')
    expect(screen.getByTestId('note-status')).toHaveClass('note-status')
  })

  it('autofocuses textarea on mount', () => {
    setupComponent()

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveFocus()
  })
})
