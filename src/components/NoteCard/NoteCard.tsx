import type { Note } from '@src/types/note'
import './NoteCard.css'
import { getNoteColor } from '@src/utils'

interface NoteCardProps {
  note: Note
  onClick: (note: Note, backgroundColor: string) => void
  index: number
}

const NoteCard = ({ note, onClick, index }: NoteCardProps) => {
  const previewContent = note.body.length > 300 ? `${note.body.slice(0, 300)}...` : note.body
  const backgroundColor = getNoteColor(index)

  return (
    <div
      data-testid={'note-card'}
      onClick={() => onClick(note, backgroundColor)}
      className={'note-card'}
      style={{ backgroundColor }}
      role={'button'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(note, backgroundColor)
        }
      }}
    >
      <p className={'note-card-content'}>{previewContent}</p>
    </div>
  )
}

export default NoteCard
