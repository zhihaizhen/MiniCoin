// @ts-nocheck
import { getTmsMessages } from '@better-bit-fe/lang';
import { withLayout } from '@better-bit-fe/base-ui';
import WealthVip from '~/components/wealthVip';
import { ReactComponent as ChatSvg } from '~/icon/app/wealthVip/chat.svg';
import Styles from '../index.module.less';
import wealthStyles from './index.module.less'

function Page() {

  return (
    <div className={wealthStyles['page-wrapper']}>
      <WealthVip />
      <div
        className={"fixed right-[16px] bottom-[180px] bg-text-brand-default p-[12px] flex items-center justify-center z-[100] cursor-pointer  rounded-lg"}
        onClick={() => { window.open('https://t.me/EasiCoin_XQ') }}
      >
        <ChatSvg className="w-[28px] h-[28px]" />
        {/* <span className="text-text-black ml-[4px] text-[14px] font-[500]">客服</span> */}
      </div>
    </div>
  );
}
export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['footer', 'error_code'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: 'EasiCoin Wealth VIP',
      description: 'EasiCoin Wealth VIP',
      ogImage: '/static/image/brand/ogImage.png',
      path: `/${locale}/referral/`
    }
  };
};

export default withLayout(Page);
