import React, { useState } from 'react';
import Link from 'next/link';
import type { Topic } from '~/types/academy';
import { ReactComponent as ExpandIcon } from '~/public/images/expand.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';

interface Props {
  topics: Topic[];
  /** 当前选中的主题 slug（主题页高亮用） */
  activeSlug?: string;
}

export function TopicNav({ topics, activeSlug }: Props) {
  const t = useFm();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className="py-6 md:py-10 text-text-primary text-xs md:text-base font-semibold md:grid md:grid-cols-[52px_minmax(0,1fr)]
      items-start gap-x-20 gap-y-[16px] md:grid-cols-[64px_minmax(0,1fr)_60px] md:gap-x-[88px]">
      <div className="hidden md:block mt-1">{t('theme')}</div>
      <div
        className={`flex min-w-0 items-center gap-x-6 gap-y-4 overflow-hidden font-semibold text-text-primary ${
          expanded ? 'flex-wrap whitespace-normal' : 'flex-nowrap whitespace-nowrap'
        }`}
      >
        <Link
          href={`${basePath}/`}
          className={`flex h-[30px] font-medium shrink-0 rounded-full h-7 px-3 flex items-center transition-colors cursor-pointer
             ${ activeSlug
              ? 'text-text-primary hover:bg-[var(--fill-tag-brand-transparent,rgba(171,225,39,0.15))] hover:text-text-brand-default-web'
              : 'bg-fill-button-brand-default text-text-black '
          }`}
        >
          {t('all')}
        </Link>

        {topics.map((topic) => {
          const active = topic.slug === activeSlug;
          return (
            <Link
              key={topic.slug}
              href={`${basePath}/topic/${topic.slug}`}
              className={`h-[30px] px-3 shrink-0 transition-colors font-medium cursor-pointer! rounded-full flex items-center ${active ? ' bg-fill-button-brand-default text-text-black'
                : 'hover:bg-[var(--fill-tag-brand-transparent,rgba(171,225,39,0.15))] hover:text-text-brand-default-web'}`}
            >
              {t(topic.slug)}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-4 md:mt-1 mx-auto cursor-pointer! col-start-2 flex items-center justify-end gap-[6px] text-xs
          font-semibold text-text-secondary md:col-start-auto hover:text-text-brand-default-web"
        aria-expanded={expanded}
      >
        {expanded ? t('fold') : t('expand')}
        <ExpandIcon className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
    </nav>
  );
}
