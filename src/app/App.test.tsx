import { render, screen } from '@testing-library/react'
import NotesList from '@src/pages/NotesList/NotesList'
import App from './App'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
  VITE_APP_SURFE_USERS_API_URL: 'usersUrl',
  BASE_URL: '/',
  DEV: '/',
}))

jest.mock('@pages/NotesList/NotesList', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid={'notes-list'}>{'Notes List Component'}</div>),
}))

const renderWithRouter = () => {
  return render(<App />)
}

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    renderWithRouter()
    expect(screen.getByTestId('notes-list')).toBeInTheDocument()
  })

  it('should render NotesList component', () => {
    renderWithRouter()
    expect(NotesList).toHaveBeenCalled()
    expect(screen.getByTestId('notes-list')).toBeInTheDocument()
    expect(screen.getByText('Notes List Component')).toBeInTheDocument()
  })

  it('should render with proper routing structure', () => {
    const { container } = renderWithRouter()

    expect(container.firstChild).toBeInTheDocument()

    expect(screen.getByTestId('notes-list')).toBeInTheDocument()
  })
})
