import React from 'react'

interface ChevronRightProps {
  className?: string
}

export function ChevronRight({ className }: ChevronRightProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M13.5787 9.35571L14.0846 9.8606L13.6031 10.3899L7.35608 17.262L6.2467 16.2522L12.0114 9.90942L6.27112 4.16919L7.33167 3.10864L13.5787 9.35571Z"
        // 使用 currentColor，便于在 CSS 中统一控制 hover/主题颜色，避免被页面全局变量污染
        fill="currentColor"
      />
    </svg>
  )
}

