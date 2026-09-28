import React, { useEffect, useState } from 'react';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { withLayout } from '@better-bit-fe/base-ui';
import { isApp, isPC } from '@better-bit-fe/base-utils';
import { ReactComponent as CardSvg } from '~/public/images/card.svg';

function Page() {
  useGlobalWidget();
  const t = useFm();
  const [seconds, setSeconds] = useState(5);
  // const { locale } = useRouter();

  const [curWindow, setCurrentWindow] = useState<Window | null>();
  useEffect(() => {
    setCurrentWindow(window)
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
    }, 1000);

    if (seconds === 0) {
      gotoHistory();
    }
    return () => clearInterval(timerId);
  }, [seconds]);
  // 倒计时
  const gotoHistory = () => {
    if (typeof curWindow === 'undefined') return;
    curWindow.location.href = '/assets/history/fiat-order';
    // if (isApp()) {
    //   const param = {
    //     methodName: 'push',
    //     moduleName: '_b_bridge_Router_',
    //     uniqueId: 'goAsset', // 用于回调
    //     params: {
    //       path: '/asset_record'
    //     }
    //   };
    //   const jsonPrams = JSON.stringify(param);
    //   if (typeof curWindow === 'undefined') return;
    //   // @ts-ignore
    //   curWindow.flutter_inappwebview.callHandler('_b_bridge_Router_', jsonPrams);
    //   // @ts-ignore
    //   curWindow._b_bridge_callback_ = cb;
    //   return;
    // }
    // if (isPC()) {
    //   if (typeof curWindow === 'undefined') return;
    //   curWindow.location.href = '/assets/history/fiat-order';
    // }
  };

  return (
    <div className='flex justify-center px-4'>
      <div className='md:w-[520px] md:h-[437px] flex flex-col items-center gap-8 md:gap-10 pb-10 pt-10 md:pt-[56px] mt-[56px] md:mt-[112px]
        border border-[#E8E4F2] rounded-2xl'>
        <div><CardSvg /></div>
        <div className='flex flex-col items-center gap-4 '>
          <h1 className='text-[#2F1663] font-semibold text-[24px] md:text-[28px]'>{t('paySuccuss')}</h1>
          <p className='text-[#808588] text-[12px] md:text-sm px-16 md:px-32'>{t('waitingTip')}</p>
        </div>
        <div className='flex justify-center items-center bg-[#ABE127] rounded-[12px] w-[295px] md:w-[343px] h-12 text-white text-[14px] font-bold'
          onClick={gotoHistory}>
          {`${t('checkStatusTip')}(${seconds}s)`}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: 'fiat', //要一一对应
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });
  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png',
      path: `https://www.easicoin.io/${locale}/paySuccess/`
    }
  };
};

export default withLayout(Page);
