import { render, screen, fireEvent } from '@testing-library/react'
import NoteCard from './NoteCard'

describe('NoteCard', () => {
  const mockNote = {
    id: 1,
    body: 'Test note content',
  }

  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders note content correctly', () => {
    render(<NoteCard note={mockNote} onClick={mockOnClick} index={0} />)
    expect(screen.getByText('Test note content')).toBeInTheDocument()
  })

  it('truncates long content and adds ellipsis', () => {
    const longNote = {
      id: 2,
      body: 'a'.repeat(400),
    }

    render(<NoteCard note={longNote} onClick={mockOnClick} index={0} />)
    expect(screen.getByText(`${'a'.repeat(300)}...`)).toBeInTheDocument()
  })

  it('does not truncate content under 300 characters', () => {
    const shortNote = {
      id: 3,
      body: 'Short content',
    }

    render(<NoteCard note={shortNote} onClick={mockOnClick} index={0} />)
    expect(screen.getByText('Short content')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    render(<NoteCard note={mockNote} onClick={mockOnClick} index={0} />)
    fireEvent.click(screen.getByText('Test note content'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct CSS classes', () => {
    render(<NoteCard note={mockNote} onClick={mockOnClick} index={0} />)
    expect(screen.getByTestId('note-card')).toHaveClass('note-card')
    expect(screen.getByText('Test note content')).toHaveClass('note-card-content')
  })
})
