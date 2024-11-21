import { render, screen, fireEvent } from '@testing-library/react'
import UsersMentionList from './UsersMentionList'
import type { User } from '@hooks/useSearchUser'

jest.mock('@src/constants', () => ({
  VITE_APP_SURFE_API_URL: 'surfUrl',
  VITE_APP_SURFE_USERS_API_URL: 'usersUrl',
}))

describe('UsersMentionList', () => {
  const mockUsers: User[] = [
    { first_name: 'John', username: 'johndoe', birthdate: 123456789 },
    { first_name: 'Jane', username: 'janesmith', birthdate: 123456790 },
  ]

  const defaultProps = {
    users: mockUsers,
    isLoading: false,
    error: null,
    selectedIndex: 0,
    onSelect: jest.fn(),
    position: { top: 100, left: 100 },
  }

  const renderComponent = (props = {}) => {
    return render(<UsersMentionList {...defaultProps} {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when no users and not loading or error', () => {
    const { container } = renderComponent({ users: [], isLoading: false, error: null })
    expect(container.firstChild).toBeNull()
  })

  it('renders loading state correctly', () => {
    renderComponent({ isLoading: true })

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading users...')).toBeInTheDocument()
    expect(screen.getByText('Loading users...').parentElement).toHaveClass('mention-list-loading')
  })

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch users'
    renderComponent({ error: errorMessage })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText(errorMessage).parentElement).toHaveClass('mention-list-error')
  })

  it('renders list of users correctly', () => {
    renderComponent()

    mockUsers.forEach((user) => {
      expect(screen.getByText(user.first_name)).toBeInTheDocument()
      expect(screen.getByText(`@${user.username}`)).toBeInTheDocument()
    })
  })

  it('positions the list correctly', () => {
    const position = { top: 150, left: 200 }
    renderComponent({ position })

    const list = screen.getByRole('listbox')
    expect(list).toHaveStyle({
      top: '150px',
      left: '200px',
    })
  })

  it('applies selected styles to the correct user', () => {
    renderComponent({ selectedIndex: 1 })

    const items = screen.getAllByRole('option')
    expect(items[1]).toHaveClass('mention-item-selected')
    expect(items[0]).not.toHaveClass('mention-item-selected')
  })

  it('calls onSelect with correct user when clicking an item', () => {
    const onSelect = jest.fn()
    renderComponent({ onSelect })

    const firstUser = screen.getByText(mockUsers[0].first_name)
    fireEvent.click(firstUser.parentElement!)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mockUsers[0])
  })

  it('marks correct item as selected with aria-selected', () => {
    renderComponent({ selectedIndex: 1 })

    const items = screen.getAllByRole('option')
    expect(items[1]).toHaveAttribute('aria-selected', 'true')
    expect(items[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('has proper accessibility attributes', () => {
    renderComponent()

    const list = screen.getByRole('listbox')
    expect(list).toHaveAttribute('aria-label', 'User mentions')
  })

  it('renders user names and usernames in correct format', () => {
    renderComponent()

    mockUsers.forEach((user) => {
      const nameElement = screen.getByText(user.first_name)
      const usernameElement = screen.getByText(`@${user.username}`)

      expect(nameElement).toHaveClass('mention-item-name')
      expect(usernameElement).toHaveClass('mention-item-username')
    })
  })

  it('renders loading spinner in loading state', () => {
    renderComponent({ isLoading: true })

    const loadingContainer = screen.getByRole('status')
    expect(loadingContainer.querySelector('svg')).toBeInTheDocument()
    expect(loadingContainer.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders error icon in error state', () => {
    renderComponent({ error: 'Error message' })

    const errorContainer = screen.getByRole('alert')
    expect(errorContainer.querySelector('svg')).toBeInTheDocument()
  })
})
