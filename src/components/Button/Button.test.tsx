import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>{'Click me'}</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant classes by default', () => {
    render(<Button>{'Primary Button'}</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('button', 'button-primary')
  })

  it('applies secondary variant classes when specified', () => {
    render(<Button variant={'secondary'}>{'Secondary Button'}</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('button', 'button-secondary')
  })

  it('renders icon when provided', () => {
    const TestIcon = () => <svg data-testid={'test-icon'} />
    render(<Button icon={<TestIcon />}>{'Button with Icon'}</Button>)

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByTestId('test-icon').parentElement).toHaveClass('button-icon')
  })

  it('forwards additional props', () => {
    render(
      <Button data-custom={'test'} aria-label={'test button'}>
        {'Test Button\r'}
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-custom', 'test')
    expect(button).toHaveAttribute('aria-label', 'test button')
  })

  it('handles disabled state', () => {
    render(<Button disabled>{'Disabled Button'}</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
