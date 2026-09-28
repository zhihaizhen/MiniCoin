import React, { FC, useEffect, useMemo, useState } from 'react';
import { getLang, isApp, isProduction } from '@better-bit-fe/base-utils';
import { ReactComponent as LogoSVG } from './icon/logo.svg';
import { ReactComponent as TwitterSvg } from './icon/twitter.svg';
import { ReactComponent as TelegramSvg } from './icon/telegram.svg';
import { ReactComponent as DiscordSvg } from './icon/discord.svg';
import { ReactComponent as InstagramSvg } from './icon/instagram.svg';
import { ReactComponent as FooterArrow } from './icon/footerArrow.svg';
import { ReactComponent as MediumSvg } from './icon/medium.svg';
import { ReactComponent as FacebookSvg } from './icon/facebook.svg';
import { ReactComponent as CommunitySvg } from './icon/community.svg';
import { ReactComponent as CollapseActiveIcon } from './icon/collapse-active.svg';
import { ReactComponent as CollapseNoActiveIcon } from './icon/collapse-noActive.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getCurrentCountryCode, getSocialMediaList } from './api';
import { DownloadBanner } from '@better-bit-fe/base-ui';
import cls from 'classnames';
import { DownloadQrcode } from '../DownloadQrcode';
import { SocialMediaMap } from './interface';
import { newIcon } from './icon/newIcon';
interface FooterProps {
  theme?: string;
  showDownloadBanner?: boolean;
}

// 交易产品配置
const TRADE_PRODUCTS = ['BTC', 'ETH', 'DOGE', 'XRP', 'SHIB', 'TSLA', 'NVDA', 'AAPL', 'AMZN', 'PAXG']

// 社交媒体链接常量
const SOCIAL_LINKS = {
  x: 'https://x.com/EasiCoin_EN',
  twitter: 'https://x.com/EasiCoin_EN',
  telegram: 'https://t.me/EasiCoin_ZH',
  facebook: 'https://www.facebook.com/profile.php?id=61581140750334',
  discord: 'https://discord.gg/c8guxZzDCu',
  instagram: 'https://www.instagram.com/easicoin_/',
  medium: 'https://medium.com/@easicoin402'
}

export const Footer: FC = ({ theme = 'dark', showDownloadBanner }: FooterProps) => {
  const t = useFm();
  const router = useRouter();
  const [showPartner, setShowPartner] = useState(false)
  const { userInfo } = useUserInfo();
  const lang = router.locale || getLang();
  const [showDownBanner, setShowDownBanner] = useState(showDownloadBanner);
  const [communityMap, setCommunityMap] = useState<SocialMediaMap>({});



  const currentYear = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    return String(year);
  }, []);

  const getUserArea = async () => {
    const { area_code, country } = await getCurrentCountryCode()
    if (area_code === '86' && country === 'CN') {
      setShowPartner(false)
    } else {
      setShowPartner(true)
    }
  }

  useEffect(() => {
    getUserArea()
  }, [])

  const getFeeUrl = () => {
    // if (userInfo) {
    //   return `/${lang}/setting/vip?user_area=${userInfo?.user_area}`
    // }
    // return `/${lang}/setting/vip`
    return `https://easicoin.zendesk.com/hc/en-us/articles/13359248554767-EasiCoin-futures-transaction-fee-explanation`
  }

  const aboutList = [
    {
      text: t('f_helpcenter'),
      url: t('url-help-center')
    },
    {
      text: t('f_global_community'),
      url: `/${lang}/community`,
      new: true
    },
    {
      text: t('f_serviceterms'),
      url: t('url-service-condition')
    },
    {
      text: t('f_privacyterms'), // 隐私条款
      url: t('url-privacy-policy')
    }
  ]

  const productList = [
    {
      text: t('f_spotTrading'),
      url: `/${lang}/spot/exchange/BTC/USDT`,
      h5url: `/${lang}/downloadApp/`
    },
    {
      text: t('f_perpetualContract'),
      url: `/${lang}/trade/usdt/BTCUSDT`,
      h5url: `/${lang}/downloadApp/`
    },
    {
      text: t('f_stock_trading'),
      url: `/${lang}/trade/usdt/TSLAUSDT`,
      h5url: `/${lang}/downloadApp/`
    },
    {
      text: t('f_metals_trading'),
      url: `/${lang}/trade/usdt/PAXGUSDT`,
      h5url: `/${lang}/downloadApp/`
    },
    {
      text: t('f_demo_trading'),
      url: `/${lang}/downloadApp/`,
      h5url: `/${lang}/downloadApp/`
    },
    {
      text: t('f_copy_trading'),
      url: `/${lang}/downloadApp/`,
      h5url: `/${lang}/downloadApp/`
    },
    {
      text: t('f_quick_buy'),
      url: `/${lang}/buy-crypto/`,
      h5url: `/${lang}/downloadApp/`
    },
    {
      text: 'APIs',
      url: `/${lang}/open-api/`,
      h5url: `/${lang}/downloadApp/`
    }
  ]

  const tradeList = TRADE_PRODUCTS.map((symbol) => ({
    text: `${t('f_buy')} ${symbol}`,
    url: `/${lang}/trade/usdt/${symbol}USDT`,
    h5url: `/${lang}/downloadApp/`
  }))

  const [serviceList, setServiceList] = useState([
    {
      text: t('f_standardRates'),
      url: getFeeUrl()
    },
    {
      text: t('f_proofOfReserves'),
      url: `/${lang}/proofOfReserves/`
    },
    {
      text: t('f_crypto_prices'),
      url: `/${lang}/markets`
    },
    {
      text: t('f_positionTiers'),
      url: `/${lang}/trading-data/position`
    },
    {
      text: t('f_position_params'),
      url: `/${lang}/trading-data/split-symbol-params`
    },
    {
      text: t('f_historical_mark_price'),
      url: `/${lang}/trading-data/price`
    },
    {
      text: t('f_historical_funding_rate'),
      url: `/${lang}/trading-data/fundfee`
    },
    {
      text: t('f_riskReserve'),
      url: `/${lang}/trading-data/risk-reserve`
    },
  ])

  const getPartnerUrl = () => {
    return isProduction ? `https://affiliates.easicoin.io/${lang}/partner-program` : `https://affiliates.test.bitrunfinance.com/${lang}/partner-program`
  }

  useEffect(() => {
    if (showPartner) {
      // 一期没有合伙人
      setServiceList([{
        text: t('f_partnerPlan'),
        url: getPartnerUrl()
      }, ...serviceList])
    }
  }, [showPartner])

  const [numActive, setNumActive] = useState({
    'about': false,
    'product': false,
    'trade': false,
    'services': false,
  });
  const onCollapseChange = (keys) => {
    setNumActive({
      ...numActive,
      [keys]: !numActive[keys],
    })
  };

  const onHideBanner = () => {
    setShowDownBanner(false)
  }

  const mediaLinks = useMemo(() => {
    // 获取当前语言的社交媒体数据，找不到则使用英文，再找不到则使用中文，最后使用兜底常量
    const getSocialUrl = (platform: string): string => {
      const localeSocial = communityMap[lang] || communityMap['en-US'] || communityMap['zh-CN'];
      if (localeSocial?.social_medias) {
        const found = localeSocial.social_medias.find(item =>
          item.name.toLowerCase() === platform.toLowerCase()
        );
        if (found?.redirect_url) {
          return found.redirect_url;
        }
      }
      return SOCIAL_LINKS[platform];
    };

    return [
      {
        icon: <TwitterSvg />,
        url: getSocialUrl('x')
      },
      {
        icon: <TelegramSvg />,
        url: getSocialUrl('telegram')
      },
      {
        icon: <FacebookSvg />,
        url: getSocialUrl('facebook')
      },
      {
        icon: <DiscordSvg />,
        url: getSocialUrl('discord')
      },
      {
        icon: <InstagramSvg />,
        url: getSocialUrl('instagram')
      },
      // {
      //   icon: <MediumSvg />,
      //   url: getSocialUrl('medium')
      // },
      {
        icon: <CommunitySvg />,
        url: `/${lang}/community`,
      },
    ];
  }, [communityMap, lang])

  const genMedias = () => {
    return (
      <>
        {
          mediaLinks.map((item, idx) => {
            return (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className='flex justify-center items-center w-11 h-11 md:w-8 md:h-8 rounded-full text-text-primary
                  bg-[var(--fill-button-tertiary-default,#28292A)]
                  transition-all duration-300
                  hover:bg-[var(--fill-button-tertiary-hover,#37393A)]
                  hover:scale-110
                  p-[7px]
                  [&_svg_path]:fill-[var(--text-primary,#F5F5F5)]'
                >
                  {item.icon}
                </div>
              </a>
            )
          })
        }
      </>
    )
  }

  useEffect(() => {
    getSocialMediaList()
      .then((res: any) => {
        if (res && Object.keys(res).length > 0) {
          setCommunityMap(res);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch social media list:', err);
      })
  }, []);

  const fontThemeColor = { 'text-white': theme === 'dark', 'text-black': theme !== 'dark' };

  const genList = (title, list, key) => {
    return (
      <div className='flex flex-col items-start md:gap-6 w-full md:w-[190px] md:flex-shrink-0'>
        {/* 桌面端标题 */}
        <h1 className='text-xl leading-7 font-medium hidden md:block text-text-primary'>{title}</h1>

        {/* 移动端可折叠标题 */}
        <div className='h-14 w-full flex justify-between items-center text-[16px] font-medium block md:hidden text-text-primary'
          onClick={() => onCollapseChange(key)}>
          {title}
          {numActive[key] ? <CollapseActiveIcon /> : <CollapseNoActiveIcon />}
        </div>

        {/* 移动端菜单项（折叠状态） */}
        {numActive[key] &&
          list.map((item, i) => {
            return (
              <div key={i} className='h-11 md:h-6 w-full block md:hidden'>
                <a className='flex items-center h-full w-full !text-text-secondary text-sm font-medium px-4' target='_self' rel="noreferrer" href={item.h5url || item.url} >
                  {item.text}
                  {item.new && <img className="inline-block w-7 h-5 ml-0.5" src={newIcon} alt="new" />}
                </a>
              </div>
            )
          })
        }

        {/* 桌面端菜单项 */}
        <div className='hidden md:flex md:flex-col gap-2'>
          {list.map((item, i) => {
            return (
              <div key={i} className='h-6 group flex items-center gap-1'>
                <a
                  className='!text-text-secondary group-hover:!text-[var(--text-brand-default)] text-sm leading-[19px] transition-colors'
                  target="_blank"
                  rel="noreferrer"
                  href={item.url}
                >
                  {item.text}
                  {item.new && <img className="inline-block mb-[1px] w-7 h-5 ml-2" src={newIcon} alt="new" />}
                </a>
                <FooterArrow className='text-[var(--text-brand-default)] opacity-0 group-hover:opacity-100 flex-shrink-0' />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cls('footer-container w-full flex flex-col items-center bg-bg-primary', { 'mb-20 md:mb-0': showDownBanner })}>
      {/* H5 顶部 Logo + 副标题 */}
      <div className='w-full flex flex-col items-start gap-4 pt-14 px-4 md:hidden'>
        <LogoSVG className='w-auto h-8' />
      </div>

      {/* 版心容器 */}
      <div className='w-full max-w-[1200px] flex flex-col items-center gap-4 md:gap-0 pb-8 pt-4 md:pt-[100px] px-4 md:px-6'>

        <div className='flex flex-col justify-between flex-1 w-full md:pb-10 md:flex-row md:gap-8'>
          {/* 左侧：四列菜单 */}
          <div className='flex flex-col md:flex-row items-start gap-0 md:gap-6'>
            {genList(t('f_aboutus'), aboutList, 'about')}
            {genList(t('f_product'), productList, 'product')}
            {genList(t('f_trade'), tradeList, 'trade')}
            {genList(t('f_services'), serviceList, 'services')}
          </div>

          {/* 右侧：下载APP和社区 */}
          <div className='flex flex-col gap-8 flex-shrink-0 md:ml-auto'>
            {/* 扫码下载 APP */}
            <div className='hidden md:flex md:flex-col gap-4'>
              <div className='text-xl leading-7 font-medium text-text-primary'>
                <p>{t('f_download_app_desc1')}</p>
                <p>{t('f_download_app_desc2')}</p>
              </div>
              <DownloadQrcode />

            </div>

            {/* 社区 */}
            <div className='hidden md:flex md:flex-col gap-4'>
              <div className='text-xl leading-7 font-medium text-text-primary'>
                {t('f_community')}
              </div>
              <div className='flex flex-wrap gap-3 max-w-[120px]'>
                {genMedias()}
              </div>
            </div>
          </div>
        </div>

        {/* 移动端社区图标 - 一行展示 */}
        <div className='w-full flex flex-col gap-8 items-center md:hidden'>
          <div className='flex justify-center gap-[17px]'>
            {genMedias()}
          </div>
        </div>
      </div>

      {/* 分隔线 - 全屏展示 */}
      <div className='w-full hidden md:block border-t-[0.5px] border-[var(--line-divider-primary,#37393A)]'></div>

      {/* 版权信息 */}
      <div className='w-full max-w-[1200px] text-text-secondary flex justify-center items-center text-xs leading-[18px] pt-2 px-4 pb-6 md:pt-6 md:pb-6 md:px-6 md:h-[52px]'>
        {t('f_copyrighttext', { year: currentYear })}
      </div>

      {showDownloadBanner && <DownloadBanner onHide={onHideBanner} />}
    </div>
  );
};
