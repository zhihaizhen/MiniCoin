import React, { useEffect, useState, useRef } from 'react';
import { getSocialMediaList } from '~/api';
import { SocialMediaMap } from '~/interface';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isApp } from '@better-bit-fe/base-utils';

const Community = () => {

  const { isLogin } = useUserInfo();
  const t = useFm();
  const [loading, setLoading] = useState(true);
  const [communityMap, setCommunityMap] = useState<SocialMediaMap>({});

  const [activeTab, setActiveTab] = useState<string>('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handleClick = () => {
    if (isLogin) {
      goPage('home')
    } else {
      goPage('register')
    }
  }

  useEffect(() => {
    setLoading(true);
    getSocialMediaList()
      .then((res: any) => {
        if (res && Object.keys(res).length > 0) {
          setCommunityMap(res);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch social media list:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 设置初始选中的 Tab
  useEffect(() => {
    const keys = Object.keys(communityMap);
    if (keys.length > 0 && !activeTab) {
      setActiveTab(keys[0]);
    }
  }, [communityMap, activeTab]);

  const scrollToSection = (key: string) => {
    setActiveTab(key);
    const element = sectionRefs.current[key];
    if (element) {
      // 获取元素位置并减去额外的20px偏移量
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 120; // 增加120px的上边距

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const tabs = Object.keys(communityMap);

 const CommunitySkeleton = () => (
    <div className="animate-pulse">
      <div className="flex gap-4 overflow-hidden pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-gray-700/50 rounded shrink-0" />
        ))}
      </div>
      <div className="space-y-12 mb-10">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="h-8 w-32 bg-gray-700/50 rounded mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-20 bg-gray-700/50 rounded-xl shadow-sm border border-line-border-default" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 0. Header 区域 - 左右布局 */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between mb-4 pb-[72px] md:pb-0 gap-2">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[32px] md:text-6xl font-bold text-text-primary leading-tight">
            {t('join-community')}
          </h1>
          <p className="text-xs md:text-base text-text-secondary max-w-xl mx-auto md:mx-0 leading-relaxed mt-2">
            {t('join-community-tips')}
          </p>
        </div>
        <div className="flex-1 w-full max-w-[380px] flex justify-center md:justify-end">
          <WebmAnimation
              className="w-full aspect-square min-w-[380px] min-h-[380px]"
              loopSrc={`${basePath}/images/community-loop.mp4`}
            />
        </div>
      </div>
       {
         loading ? <CommunitySkeleton/> : tabs.length === 0 ?
           <div className="py-20 text-center text-text-secondary">
              {t('no-data')}
           </div> :
           <>
             {/* 1. Tab 选项卡 - 横向滚动 */}
            <div className={`sticky z-10 bg-bg-primary pb-6 md:pb-4 ${isApp() ? 'top-0' : 'top-16'}`}>
              <div className="flex overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar">
                <div className="flex gap-4 relative">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      data-tab={tab}
                      onClick={() => scrollToSection(tab)}
                      className={`relative pb-2 px-1 text-lg font-medium transition-colors duration-200 ${
                        activeTab === tab
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t(`lang-${tab}`)}
                    </button>
                  ))}
                  <span
                    className="absolute bottom-0 h-1 bg-white transition-all duration-300 ease-out"
                    style={{
                      width: '16px',
                      left: tabs.indexOf(activeTab) >= 0
                        ? `calc(${tabs.slice(0, tabs.indexOf(activeTab)).reduce((acc, tab) => {
                          const button = document.querySelector(`button[data-tab="${tab}"]`) as HTMLElement;
                          const buttonWidth = button?.offsetWidth || 0;
                          return acc + buttonWidth + 16; // 16px is gap
                        }, 0)}px + ${((document.querySelector(`button[data-tab="${activeTab}"]`) as HTMLElement)?.offsetWidth || 0) / 2}px - 8px)`
                        : '0px'
                    }}
                  />
                </div>
              </div>
            </div>
            {/* 2 & 3. 模块内容 - 标题 + 三列网格布局 */}
            <div className="space-y-6 md:space-y-16 md:mt-10 pl-1">
              {tabs.map((key) => (
                <div
                  key={key}
                  ref={(el) => (sectionRefs.current[key] = el)}
                  className="scroll-mt-24"
                >
                  <h3 className="text-lg md:text-[22px] font-medium md:font-bold text-text-primary mb-8">
                     {t(`lang-${key}`)}
                  </h3>

                  {/* 三列网格布局，子元素包含 a 标签 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communityMap[key].social_medias.sort((a, b) => a.seq - b.seq).map((item, idx) => (
                      <a
                        key={`${key}-${item.name}-${idx}`}
                        href={item.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-xl shadow-sm border border-line-border-default hover:shadow-md hover:border-line-border-hover transition-all group"
                      >
                        <div className="shrink-0 mr-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.pic_url}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              // (e.target as HTMLImageElement).src = `${basePath}/images/default-social.png`;
                            }}
                          />
                        </div>
                        <div className="grow overflow-hidden">
                          <p className="text-base font-medium text-text-secondary truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="shrink-0 text-gray-300 group-hover:text-text-brand-default-web ">
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
           </>
       }
    </div>
      {/* footer */}
    <div className="flex flex-col items-center justify-center gap-10 py-4 px-[45px] space-y-2 pt-[90px] pb-[70px] bg-[linear-gradient(180deg,#070808_6.5%,#587C00_142%)] mt-[72px] md:mt-20">
      <div className="text-2xl md:text-[40px] text-white font-semibold">{isLogin ? t('community-footer-tip2') : t('community-footer-tip')}</div>
      <div className="w-full md:w-auto min-w-[240px] text-text-black bg-fill-button-brand-default rounded-xl flex items-center justify-center hover:bg-fill-button-brand-hover transition-all cursor-pointer px-4 py-3 text-[16px] font-medium" onClick={handleClick}>
        {isLogin ? t('go-home') : t('register-login')}
      </div>
    </div>
    </>
  );
}

export default Community;
