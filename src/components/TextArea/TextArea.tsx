import React, { useCallback, useRef, useState, useEffect, forwardRef } from 'react'
import './TextArea.css'

interface TextAreaProps {
  value: string
  onChange: (value: string) => void
  onCursorChange?: (position: number) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  className?: string
  placeholder?: string
  'aria-label'?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      value,
      onChange,
      onCursorChange,
      onKeyDown,
      className = '',
      placeholder = '',
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = useState(value)
    const debounceTimerRef = useRef<number>()
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      setLocalValue(value)
    }, [value])

    const getHighlightedText = (text: string) => {
      const mentionRegex = /@(\w+)/g
      let lastIndex = 0
      const result = []
      let match

      while ((match = mentionRegex.exec(text)) !== null) {
        // insert text before the mention
        if (match.index > lastIndex) {
          result.push(text.slice(lastIndex, match.index))
        }

        //now insert highlighed mention
        result.push(
          <span key={match.index} className={'mention-highlight'}>
            {match[0]}
          </span>,
        )

        lastIndex = match.index + match[0].length
      }

      //rest of text
      if (lastIndex < text.length) {
        result.push(text.slice(lastIndex))
      }

      return result
    }

    const updateCursorPosition = useCallback(() => {
      const textArea = ref as React.RefObject<HTMLTextAreaElement>
      if (textArea.current && onCursorChange) {
        onCursorChange(textArea.current.selectionStart)
      }
    }, [onCursorChange, ref])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setLocalValue(newValue)

        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = window.setTimeout(() => {
          onChange(newValue)
        }, 500)

        updateCursorPosition()
      },
      [onChange, updateCursorPosition],
    )

    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current)
        }
      }
    }, [])

    const handleSelect = useCallback(() => {
      updateCursorPosition()
    }, [updateCursorPosition])

    //sync scroll position between textarea and overlay
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (overlayRef.current) {
        overlayRef.current.scrollTop = e.currentTarget.scrollTop
      }
    }

    return (
      <div className={'textarea-wrapper'}>
        <div ref={overlayRef} className={'textarea-overlay'} aria-hidden={'true'}>
          {getHighlightedText(localValue)}
        </div>
        <textarea
          ref={ref}
          value={localValue}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onClick={updateCursorPosition}
          onSelect={handleSelect}
          onScroll={handleScroll}
          placeholder={placeholder}
          className={className}
          autoFocus
          spellCheck
          aria-label={ariaLabel}
        />
      </div>
    )
  },
)

export default TextArea
