import React, { useCallback, useRef, useState, useEffect, forwardRef } from 'react'

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

    useEffect(() => {
      setLocalValue(value)
    }, [value])

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

    return (
      <textarea
        ref={ref}
        value={localValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onClick={updateCursorPosition}
        onSelect={handleSelect}
        placeholder={placeholder}
        className={className}
        autoFocus
        spellCheck
        aria-label={ariaLabel}
      />
    )
  },
)

export default TextArea
