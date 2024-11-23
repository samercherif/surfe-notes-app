import type { Note } from '@src/types/note'
import './NoteCard.css'

interface NoteCardProps {
  note: Note
  onClick: (note: Note) => void
}

const NoteCard = ({ note, onClick }: NoteCardProps) => {
  const previewContent = note.body.length > 300 ? `${note.body.slice(0, 300)}...` : note.body

  return (
    <div
      data-testid={'note-card'}
      onClick={() => onClick(note)}
      className={'note-card'}
      role={'button'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(note)
        }
      }}
    >
      <p className={'note-card-content'}>{previewContent}</p>
    </div>
  )
}

export default NoteCard
