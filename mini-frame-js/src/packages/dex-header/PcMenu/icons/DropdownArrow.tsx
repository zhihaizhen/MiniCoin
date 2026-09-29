import React from 'react'

interface DropdownArrowProps {
  open: boolean
  className?: string
}

export function DropdownArrow({ open, className }: DropdownArrowProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={open
          ? 'M11.3037 11.3333C11.8585 11.3333 12.1706 10.6953 11.83 10.2574L8.5264 6.0099C8.25949 5.66674 7.74083 5.66674 7.47393 6.0099L4.17036 10.2574C3.82976 10.6953 4.14182 11.3333 4.69659 11.3333H11.3037Z'  // 向上
          : 'M11.3037 5C11.8585 5 12.1706 5.63806 11.83 6.07596L8.5264 10.3234C8.25949 10.6666 7.74083 10.6666 7.47393 10.3234L4.17036 6.07596C3.82976 5.63806 4.14182 5 4.69659 5H11.3037Z'  // 向下
        }
        fill="currentColor"
      />
    </svg>
  )
}

