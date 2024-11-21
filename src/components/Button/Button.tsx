import React from 'react'
import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  icon?: React.ReactNode
}

const Button = ({ children, variant = 'primary', icon, className = '', ...props }: ButtonProps) => {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {icon && <span className={'button-icon'}>{icon}</span>}
      {children}
    </button>
  )
}

export default Button
