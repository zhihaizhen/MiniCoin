import React from 'react';

interface PaginationIndicatorProps {
  total: number;
  activeIndex: number;
  className?: string;
}

const PaginationIndicator = ({total, activeIndex, className }: PaginationIndicatorProps) => {

  return (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 transition-all duration-300 ${
            i === activeIndex
              ? 'w-5 bg-text-brand-default-web'
              : 'w-2 bg-[#D9D9D9]'
          }`}
        />
      ))}
    </div>
  );
}

export default PaginationIndicator;
