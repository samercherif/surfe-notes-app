import type { User } from '@hooks/useSearchUser'
import './UsersMentionList.css'

interface MentionListProps {
  users: User[]
  isLoading: boolean
  error: string | null
  selectedIndex: number
  onSelect: (user: User) => void
  position: { top: number; left: number }
}

const MentionList = ({
  users,
  isLoading,
  error,
  selectedIndex,
  onSelect,
  position,
}: MentionListProps) => {
  if (!isLoading && !error && users.length === 0) return null

  return (
    <div
      className={'mention-list'}
      style={{ top: position.top, left: position.left }}
      role={'listbox'}
      aria-label={'User mentions'}
    >
      {isLoading ? (
        <div className={'mention-list-loading'} role={'status'}>
          <svg
            className={'animate-spin h-4 w-4'}
            xmlns={'http://www.w3.org/2000/svg'}
            fill={'none'}
            viewBox={'0 0 24 24'}
          >
            <circle
              className={'opacity-25'}
              cx={'12'}
              cy={'12'}
              r={'10'}
              stroke={'currentColor'}
              strokeWidth={'4'}
            />
            <path
              className={'opacity-75'}
              fill={'currentColor'}
              d={
                'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              }
            />
          </svg>
          <span>{'Loading users...'}</span>
        </div>
      ) : error ? (
        <div className={'mention-list-error'} role={'alert'}>
          <svg className={'h-4 w-4'} fill={'none'} viewBox={'0 0 24 24'} stroke={'currentColor'}>
            <path
              strokeLinecap={'round'}
              strokeLinejoin={'round'}
              strokeWidth={2}
              d={'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}
            />
          </svg>
          <span>{error}</span>
        </div>
      ) : (
        users.map((user, index) => (
          <div
            key={user.birthdate + user.birthdate}
            className={`mention-item ${index === selectedIndex ? 'mention-item-selected' : ''}`}
            onClick={() => onSelect(user)}
            role={'option'}
            aria-selected={index === selectedIndex}
          >
            <div className={'mention-item-info'}>
              <div className={'mention-item-name'}>{user.first_name}</div>
              <div className={'mention-item-username'}>
                {'@'}
                {user.username}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default MentionList
