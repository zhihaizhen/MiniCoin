import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { ReactComponent as SearchIcon } from '~/public/images/search.svg';


const Header: React.FC = () => {
  const t = useFm();
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const maxKeywordLength = 20;

  const handleSearch = () => {
    const search = keyword.trim();
    if (!search) return;
    router.push({
      pathname: `${basePath}/search-list`,
      query: { search }
    });
  };

  return (
    <div className="w-full px-4 md:px-0 py-0 md:py-[70px]">

      <div
        className="max-w-[1200px] mx-auto flex justify-between items-center md:flex-row flex-col-reverse overflow-hidden *:shrink-0">
        <div className="max-w-[580px] md:w-auto w-full mt-8 md:mt-0 md:pr-10">
          <h2
            className="text-base md:text-xl text-center md:text-left text-text-brand-default-web font-bold md:font-semibold">
            {t('header.subtitle')}
          </h2>
          <h1
            className="text-[32px] md:text-5xl font-bold md:font-semibold text-text-white mt-5 md:leading-14 text-center md:text-left leading-10">
            {t('header.title')}
          </h1>
          <div
            className="w-full md:w-[320px] h-12 pl-4 pr-2 py-2 mt-6 md:mt-8 flex items-center justify-between rounded-xl
            bg-[var(--fill-fill-input,#1F2023)] border hover:border-line-border-hover ">
            <input
              className="w-full h-full bg-transparent outline-none text-text-primary"
              type="text"
              placeholder="🔥 BTC"
              value={keyword}
              maxLength={maxKeywordLength}
              onChange={(e) => setKeyword(e.target.value.trim().slice(0, maxKeywordLength))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <div
              className="w-9 h-8 flex items-center justify-center bg-fill-button-primary-default rounded-lg cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={handleSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            >
              <SearchIcon />
            </div>
          </div>
        </div>
        <div className="w-full md:w-[600px] md:h-[400px]">
          <WebmAnimation
            className="w-full h-[250px] md:h-[400px]"
            loopSrc={`${basePath}/images/loop.mp4`}
          />
        </div>
      </div>
    </div>
  );
};

export { Header };
