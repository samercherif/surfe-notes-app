import type { Note } from '@src/types/note'
import './NoteCard.css'

interface NoteCardProps {
  note: Note
  onClick: (note: Note) => void
}

const NoteCard = ({ note, onClick }: NoteCardProps) => {
  const previewContent = note.body.length > 100 ? `${note.body.slice(0, 100)}...` : note.body

  return (
    <div data-testid={'note-card'} onClick={() => onClick(note)} className={'note-card'}>
      <p className={'note-card-content'}>{previewContent}</p>
    </div>
  )
}

export default NoteCard
