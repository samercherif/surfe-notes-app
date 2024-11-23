import { useAutoSaveNote } from '@hooks/UseAutoSaveNote'
import { useUserSearch, type User } from '@hooks/useSearchUser'
import { useParams } from 'react-router-dom'
import React, { useState, useRef, useCallback } from 'react'
import './NoteEditor.css'
import UsersMentionList from '@components/UsersMentionList/UsersMentionList'
import { EDITOR, TEXT, MENTIONS } from './constants'

const NoteEditor = () => {
  const { id: noteId } = useParams()
  const { content, setContent, isSaving, lastSavedAt } = useAutoSaveNote(noteId || '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)

  const { searchTerm, users, isLoading, error } = useUserSearch(content, cursorPosition)

  const getMentionListPosition = useCallback(() => {
    if (!textareaRef.current) return { top: 0, left: 0 }

    const textarea = textareaRef.current
    const text = textarea.value
    const cursorPosition = textarea.selectionEnd

    const textBeforeCursor = text.substring(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf('@')
    if (atIndex === -1) return { top: 0, left: 0 }

    const textToAt = text.substring(0, atIndex)

    const lines = textToAt.split('\n')
    const currentLineNumber = lines.length - 1

    const currentLineText = lines[currentLineNumber]

    const { top: textareaTop, left: textareaLeft } = textarea.getBoundingClientRect()

    const top =
      textareaTop +
      EDITOR.PADDING +
      currentLineNumber * TEXT.LINE_HEIGHT +
      TEXT.LINE_HEIGHT +
      MENTIONS.OFFSET -
      textarea.scrollTop

    const left = textareaLeft + EDITOR.PADDING + currentLineText.length * TEXT.CHAR_WIDTH

    return { top, left }
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setCursorPosition(e.target.selectionStart)
    setSelectedIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchTerm || users.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % users.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length)
        break
      case 'Enter':
        e.preventDefault()
        insertMention(users[selectedIndex])
        break
      case 'Escape':
        e.preventDefault()
        setCursorPosition(0)
        break
    }
  }

  const insertMention = (user: User) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const cursorPosition = textarea.selectionStart
    const textBeforeMention = content.slice(0, cursorPosition - (searchTerm?.length || 0) - 1)
    const textAfterMention = content.slice(cursorPosition)
    const newContent = `${textBeforeMention}@${user.username} ${textAfterMention}`

    setContent(newContent)
    setCursorPosition(0)

    // displace cursor after the inserted mention
    const newCursorPosition = textBeforeMention.length + user.username.length + 2
    setTimeout(() => {
      textarea.selectionStart = newCursorPosition
      textarea.selectionEnd = newCursorPosition
      textarea.focus()
    }, 0)
  }

  const getStatusText = () => {
    if (isSaving) return 'Saving changes...'
    if (lastSavedAt) return 'All changes saved!'
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
        <div className={'note-editor-wrapper'}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onClick={() => setCursorPosition(textareaRef.current?.selectionStart || 0)}
            onSelect={() => setCursorPosition(textareaRef.current?.selectionStart || 0)}
            placeholder={'Start writing your note...'}
            className={'note-textarea'}
            autoFocus
            spellCheck={'true'}
            aria-label={'Note content'}
          />
          {searchTerm && (
            <UsersMentionList
              users={users}
              isLoading={isLoading}
              error={error}
              selectedIndex={selectedIndex}
              onSelect={insertMention}
              position={getMentionListPosition()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteEditor
