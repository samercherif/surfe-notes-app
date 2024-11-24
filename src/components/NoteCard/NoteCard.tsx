import type { Note } from '@src/types/note'
import './NoteCard.css'
import { getNoteColor } from '@src/utils'
import FormattedNoteContent from './FormattedNoteContent'

interface NoteCardProps {
  note: Note
  onClick: (note: Note, backgroundColor: string) => void
  index: number
}

const NoteCard = ({ note, onClick, index }: NoteCardProps) => {
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
      <div className={'note-card-content'}>
        <FormattedNoteContent content={note.body} maxLength={300} />
      </div>
    </div>
  )
}

export default NoteCard
