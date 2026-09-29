import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as AppStoreIcon } from '~/public/images/app-store.svg';
import { QRCode } from 'antd';
import { useUserInfo } from '@better-bit-fe/base-provider';

const ArticleFooter: React.FC = () => {
  const t = useFm();
  const router = useRouter();
  const { isLogin } = useUserInfo();
  const [account, setAccount] = useState('');


  const handleRegister = () => {
    const username = account.trim();
    const locale = router.locale || router.defaultLocale || 'en-US';
    const query = username ? `?username=${encodeURIComponent(username)}` : '';

    window.location.href = `/${locale}/account/register${query}`;
  };
  const lang = getLang();
  const downLoadUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return `${origin}/${lang}/downloadApp`;
  }, [lang]);

  return (
    <footer className="w-full pb-10">
      <div className="relative mx-auto md:min-h-[360px] w-full max-w-[1200px] overflow-hidden rounded-2xl px-4 py-7 md:px-0 md:py-8">
        {
          isLogin === false && (
            <div className="relative z-10 flex flex-col gap-8 md:gap-6 md:flex-row md:items-start md:justify-between">
          <h2 className="max-w-[480px] text-2xl font-mediumbold md:font-bold text-text-primary md:text-[32px] md:leading-[48px]">
            {t('footer-tip1')}
          </h2>

          <div className="flex h-[56px] md:h-[64px] w-full md:w-[400px] items-center rounded-xl bg-bg-secondary p-2">
            <input
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-text-primary outline-none placeholder:text-text-tertiary"
              type="text"
              placeholder={t('input-placeholder')}
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleRegister();
                }
              }}
            />
            <button
              className="h-full shrink-0 rounded-[12px] bg-text-white px-[22px] text-base font-semibold text-text-black"
              type="button"
              onClick={handleRegister}
            >
              {t('register')}
            </button>
          </div>
        </div>
          )
        }

        <div className="hidden md:block relative min-h-[320px] rounded-[40px] bg-text-brand-default-web px-20 py-10 mt-[356px]">
          <div className="relative z-10 max-w-[440px]">
            <h3 className="text-[28px] font-semibold leading-[36px] text-[#050505] md:text-[34px] md:leading-[42px]">
              {t('footer-tip2')}
            </h3>
            <div className="mt-4 mb-6">
              <AppStoreIcon />
            </div>
            <QRCode size={100} bordered={false} value={downLoadUrl} />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pointer-events-none absolute bottom-0 right-[-6px] hidden h-[580px] w-auto md:block"
            src={`${basePath}/images/footer-phone.png`}
            alt=""
          />
        </div>
      </div>
    </footer>
  );
};

export { ArticleFooter };
