import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useAutoSaveNote } from '@hooks/UseAutoSaveNote'
import { useUserSearch, type User } from '@hooks/useSearchUser'
import { EDITOR, TEXT, MENTIONS } from './constants'
import UsersMentionList from '@components/UsersMentionList/UsersMentionList'
import TextArea from '@components/TextArea/TextArea'
import './NoteEditor.css'

const NoteEditor = () => {
  const { id: noteId } = useParams()
  const { content, setContent, isSaving, lastSavedAt } = useAutoSaveNote(noteId || '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const location = useLocation()
  const backgroundColor = location.state?.backgroundColor
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const { searchTerm, users, isLoading, error } = useUserSearch(content, cursorPosition)

  const editorBackground = backgroundColor ?? 'bg-gray-50'

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= EDITOR.SMALL_SCREEN_BREAKPOINT)
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getEditorWidth = () => {
    return isSmallScreen ? EDITOR.SMALL_SCREEN_WIDTH : EDITOR.WIDTH
  }

  const getMentionListPosition = useCallback(() => {
    if (!textareaRef.current) return { top: 0, left: 0 }

    const textarea = textareaRef.current
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionEnd)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex === -1) return { top: 0, left: 0 }

    const textToAt = textBeforeCursor.substring(0, atIndex)
    const currentEditorWidth = getEditorWidth()
    const availableWidth = currentEditorWidth - (isSmallScreen ? EDITOR.PADDING * 1.5 : EDITOR.PADDING * 2)
    const charsPerLine = Math.floor(availableWidth / TEXT.CHAR_WIDTH)

    // split text by explicit line breaks first
    const explicitLines = textToAt.split('\n')

    // calculate lines for each explicit line
    const allLines: string[] = []
    explicitLines.forEach((line) => {
      //split long lines into wrapped lines
      for (let i = 0; i < line.length; i += charsPerLine) {
        allLines.push(line.slice(i, i + charsPerLine))
      }
      //handle empty lines with break \n
      if (line.length === 0) {
        allLines.push('')
      }
    })

    // textarea coordinates
    const { top: textareaTop, left: textareaLeft } = textarea.getBoundingClientRect()

    const lineIndex = allLines.length - 1
    const lastLine = allLines[lineIndex] || ''
    const lastLineLength = lastLine.length

    const top = textareaTop + 
                (isSmallScreen ? EDITOR.PADDING * 0.75 : EDITOR.PADDING) + 
                (lineIndex + 1) * TEXT.LINE_HEIGHT - 
                textarea.scrollTop

    const left = textareaLeft + 
                (isSmallScreen ? EDITOR.PADDING * 0.75 : EDITOR.PADDING) + 
                lastLineLength * TEXT.CHAR_WIDTH

    //keep mention list inside the screen
    const mentionsWidth = isSmallScreen ? MENTIONS.SMALL_SCREEN_WIDTH : MENTIONS.WIDTH
    const adjustedLeft = Math.min(left, window.innerWidth - mentionsWidth - 10)

    return {
      top,
      left: adjustedLeft,
    }
  }, [isSmallScreen])

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
    <div
      className={'note-editor'}
      data-testid={'note-editor'}
      style={{
        boxShadow: `inset 0 0 300px 200px ${editorBackground}`,
      }}
    >
      <div className={'note-container'} data-testid={'note-container'}>
        <div className={'note-status'} data-testid={'note-status'}>
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
        <div className={'note-editor-wrapper'}>
          <TextArea
            ref={textareaRef}
            value={content}
            onChange={setContent}
            onCursorChange={setCursorPosition}
            onKeyDown={handleKeyDown}
            placeholder={'Start writing your note...'}
            className={'note-textarea'}
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
