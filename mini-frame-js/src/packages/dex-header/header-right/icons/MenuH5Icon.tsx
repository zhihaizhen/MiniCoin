import React from 'react'

export interface MenuH5IconProps {
  className?: string
  onClick?: () => void
}

export function MenuH5Icon({ className, onClick }: MenuH5IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <path d="M20 18.5H4V16.5H20V18.5ZM20 13H4V11H20V13ZM20 7.5H4V5.5H20V7.5Z" fill="currentColor" />
    </svg>
  )
}


