import React from 'react';
import Link from 'next/link';
import type { Article } from '~/types/academy';
import { formatPublishedAt } from '~/utils/format';

interface Props {
  article: Article;
}

export function ArticleCard({ article }: Props) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-[#28292a] bg-[#191b1d] transition-colors hover:border-[#474a4d]"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-[#0f1011]">
        {article.web_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.web_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1f2123] to-[#0f1011]" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[12px] p-[16px]">
        <div className="flex items-center gap-[8px] text-[12px] text-[#8f9499]">
          <span>{formatPublishedAt(article.date)}</span>
        </div>
        <h3 className="line-clamp-2 text-[16px] font-medium text-white">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-[14px] text-[#8f9499]">
          {article.description}
        </p>
      </div>
    </Link>
  );
}
