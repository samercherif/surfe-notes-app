import type { Note } from '@src/types/note'
import { useNotes } from '@hooks/useNotes'
import NoteCard from '@components/NoteCard/NoteCard'
import './NotesList.css'

const NotesPage = () => {
  const { notes, isLoading, error } = useNotes()

  const handleNoteClick = (note: Note) => {
    // TODO: note selection/viewing/editing logic
    console.log('Note clicked:', note.id)
  }

  // TODO: improve loading UI
  if (isLoading) {
    return (
      <div data-testid={'notes-container'} className={'notes-container'}>
        <h1 className={'notes-title'}>{'My Notes'}</h1>
        <div data-testid={'notes-message'} className={'notes-message'}>
          <p>{'Loading notes...'}</p>
        </div>
      </div>
    )
  }

  // TODO: improve error handling ui
  if (error) {
    return (
      <div data-testid={'notes-container'} className={'notes-container'}>
        <h1 className={'notes-title'}>{'My Notes'}</h1>
        <div data-testid={'notes-message'} className={'notes-message'}>
          <p className={'notes-error'}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid={'notes-container'} className={'notes-container'}>
      <h1 className={'notes-title'}>{'My Notes'}</h1>
      {/* TODO: improve notes creation when notes list is empty, maybe display and empty card with add button */}
      {!notes.length ? (
        <div data-testid={'notes-message'} className={'notes-message'}>
          <p>{'No notes found. Create your first note!'}</p>
        </div>
      ) : (
        <div data-testid={'notes-grid'} className={'notes-grid'}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={handleNoteClick} />
          ))}
        </div>
      )}
    </div>
  )
}

export default NotesPage
