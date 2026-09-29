import React, { useEffect } from 'react';

interface PaginationIndicatorProps {
  total: number;
  activeIndex: number;
}

const PaginationIndicator = ({total, activeIndex, }: PaginationIndicatorProps) => {

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i === activeIndex ? 'w-5 bg-white opacity-100' : 'w-2 bg-[#59595B]'
          }`}
        />
      ))}
    </div>
  );
}

export default PaginationIndicator;
