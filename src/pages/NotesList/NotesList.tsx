import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Note } from '@src/types/note'
import { useNotes } from '@hooks/useNotes'
import { useClients } from '@src/api/ApiClientContext'
import NoteCard from '@components/NoteCard/NoteCard'
import Button from '@components/Button/Button'
import PlusIcon from '@components/icons/PlusIcon'
import './NotesList.css'

const NotesPage = () => {
  const { notes, isLoading, error, fetchNotes } = useNotes()
  const navigate = useNavigate()
  const { apiClient } = useClients()

  useLayoutEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleNoteClick = (note: Note, backgroundColor: string) => {
    navigate(`/notes/${note.id}`, { state: { backgroundColor } })
  }

  const handleCreateNote = async () => {
    try {
      const response = await apiClient.post<Note>('/notes', {
        body: ' ',
      })
      navigate(`/notes/${response.data.id}`)
    } catch (err) {
      console.error('Failed to create note:', err)
    }
  }

  if (isLoading) {
    return (
      <div data-testid={'notes-container'} className={'notes-container'}>
        <h1 className={'notes-title'}>{'My Notes'}</h1>
        <div data-testid={'notes-message'} className={'notes-message flex items-center gap-2'}>
          <svg
            className={'animate-spin h-5 w-5 text-gray-500'}
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
            ></circle>
            <path
              className={'opacity-75'}
              fill={'currentColor'}
              d={
                'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              }
            ></path>
          </svg>
          <span>{'Loading notes...'}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid={'notes-container'} className={'notes-container'}>
        <h1 className={'notes-title'}>{'My Notes'}</h1>
        <div data-testid={'notes-message'} className={'notes-message'}>
          <div className={'flex items-center text-red-500'}>
            <svg
              className={'w-5 h-5 mr-2'}
              fill={'none'}
              viewBox={'0 0 24 24'}
              stroke={'currentColor'}
            >
              <path
                strokeLinecap={'round'}
                strokeLinejoin={'round'}
                strokeWidth={'2'}
                d={'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}
              />
            </svg>
            <p className={'notes-error'}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid={'notes-container'} className={'notes-container'}>
      <div className={'flex items-center justify-between mb-8 px-4'}>
        <h1 className={'notes-title'}>{'My Notes'}</h1>
        <Button onClick={handleCreateNote} icon={<PlusIcon />}>
          {'New Note\r'}
        </Button>
      </div>

      {!notes.length ? (
        <div data-testid={'notes-message'} className={'notes-message'}>
          <div className={'text-center'}>
            <svg
              className={'mx-auto h-12 w-12 text-gray-400'}
              fill={'none'}
              viewBox={'0 0 24 24'}
              stroke={'currentColor'}
            >
              <path
                strokeLinecap={'round'}
                strokeLinejoin={'round'}
                strokeWidth={'2'}
                d={
                  'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                }
              />
            </svg>
            <p className={'mt-2'}>{'No notes found. Create your first note!'}</p>
          </div>
        </div>
      ) : (
        <div data-testid={'notes-grid'} className={'notes-grid'}>
          {notes.map((note, index) => (
            <NoteCard key={note.id} note={note} onClick={handleNoteClick} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default NotesPage
