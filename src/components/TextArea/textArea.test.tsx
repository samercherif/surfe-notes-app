import { render, screen, fireEvent, act } from '@testing-library/react'
import { createRef } from 'react'
import TextArea from './TextArea'

describe('TextArea', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    onCursorChange: jest.fn(),
  }

  it('renders with custom props', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(
      <TextArea
        {...defaultProps}
        ref={ref}
        placeholder={'Test placeholder'}
        className={'test-class'}
        aria-label={'Test label'}
      />,
    )

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Test placeholder')
    expect(textarea).toHaveClass('test-class')
    expect(textarea).toHaveFocus()
    expect(textarea).toHaveAttribute('aria-label', 'Test label')
    expect(ref.current).toBe(textarea)
  })

  it('debounces onChange calls', () => {
    const onChange = jest.fn()
    const ref = createRef<HTMLTextAreaElement>()
    render(<TextArea {...defaultProps} onChange={onChange} ref={ref} />)

    const textarea = screen.getByRole('textbox')

    act(() => {
      fireEvent.change(textarea, { target: { value: 'test' } })
    })

    expect(onChange).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('updates cursor position on click', () => {
    const onCursorChange = jest.fn()
    const ref = createRef<HTMLTextAreaElement>()
    render(
      <TextArea {...defaultProps} value={'test text'} onCursorChange={onCursorChange} ref={ref} />,
    )

    const textarea = screen.getByRole('textbox')

    Object.defineProperty(textarea, 'selectionStart', {
      value: 4,
      configurable: true,
    })

    fireEvent.click(textarea)
    expect(onCursorChange).toHaveBeenCalledWith(4)
  })

  it('handles keydown events', () => {
    const onKeyDown = jest.fn()
    const ref = createRef<HTMLTextAreaElement>()
    render(<TextArea {...defaultProps} onKeyDown={onKeyDown} ref={ref} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(onKeyDown).toHaveBeenCalled()
  })

  it('cleans up debounce timer on unmount', () => {
    const onChange = jest.fn()
    const ref = createRef<HTMLTextAreaElement>()
    const { unmount } = render(<TextArea {...defaultProps} onChange={onChange} ref={ref} />)

    const textarea = screen.getByRole('textbox')

    act(() => {
      fireEvent.change(textarea, { target: { value: 'test' } })
    })

    unmount()

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('syncs with external value changes', () => {
    const ref = createRef<HTMLTextAreaElement>()
    const { rerender } = render(<TextArea {...defaultProps} ref={ref} value={'initial'} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('initial')

    rerender(<TextArea {...defaultProps} ref={ref} value={'updated'} />)
    expect(textarea).toHaveValue('updated')
  })
})
