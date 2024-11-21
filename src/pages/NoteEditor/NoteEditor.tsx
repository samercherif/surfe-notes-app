import { useAutoSaveNote } from '@hooks/UseAutoSaveNote'
import { useParams } from 'react-router-dom'
import './NoteEditor.css'

const NoteEditor = () => {
  const { id: noteId } = useParams()
  const { content, setContent, isSaving, lastSavedAt } = useAutoSaveNote(noteId || '')

  const getStatusText = () => {
    if (isSaving) return 'Saving changes...'
    if (lastSavedAt) return `All changes saved!`
    return ''
  }

  return (
    <div className={'note-editor'} data-testid={'note-editor'}>
      <div className={'note-container'} data-testid={'note-container'}>
        <div className={'note-status'} data-testid={'note-status'}>
          <div className={'note-status-indicator'}>
            {(isSaving || lastSavedAt) && (
              <>
                <span
                  data-testid={'status-dot'}
                  className={`note-status-dot ${
                    isSaving ? 'note-status-dot-saving' : 'note-status-dot-saved'
                  }`}
                  aria-hidden={'true'}
                />
                <span aria-live={'polite'}>{getStatusText()}</span>
              </>
            )}
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'Start writing your note...'}
          className={'note-textarea'}
          autoFocus
          spellCheck={'true'}
          aria-label={'Note content'}
        />
      </div>
    </div>
  )
}

export default NoteEditor
