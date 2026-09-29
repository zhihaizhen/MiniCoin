import React, { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { useI18n } from '@/utils/i18n'
import { getCurrentYear } from '@/utils'
import { isProd } from '@/utils/host'
import { getLanguage, useLanguageValue } from '@/packages/dex-header/hooks/useLanguage'
import { getSocialMediaList } from './api'
import type { SocialMediaMap } from './types'
import {
  LogoSVG,
  TwitterSvg,
  TelegramSvg,
  FacebookSvg,
  DiscordSvg,
  InstagramSvg,
  CommunitySvg,
  FooterArrow,
  CollapseActiveIcon,
  CollapseNoActiveIcon,
  BannerAppLogo,
  BannerCloseIcon
} from './icons'
import { newIcon as NEW_ICON } from './icons/newIcon'
import styles from './styles/large.module.less'
import bannerStyles from './styles/downloadBanner.module.less'

const TRADE_PRODUCTS = ['BTC', 'ETH', 'DOGE', 'XRP', 'SHIB', 'TSLA', 'NVDA', 'AAPL', 'AMZN', 'PAXG']

const SOCIAL_LINKS: Record<string, string> = {
  x: 'https://x.com/EasiCoin_EN',
  twitter: 'https://x.com/EasiCoin_EN',
  telegram: 'https://t.me/EasiCoin_ZH',
  facebook: 'https://www.facebook.com/profile.php?id=61581140750334',
  discord: 'https://discord.gg/c8guxZzDCu',
  instagram: 'https://www.instagram.com/easicoin_/',
  medium: 'https://medium.com/@easicoin402'
}

interface MenuItem {
  text: string
  url: string
  h5url?: string
  new?: boolean
}

function DownloadBanner({ onHide }: { onHide?: () => void }) {
  const { t } = useI18n('footer')
  const [isShow, setIsShow] = useState(true)

  const onClose = () => {
    setIsShow(false)
    onHide?.()
  }

  const onDownload = () => {
    const lang = getLanguage()
    window.location.pathname = `${lang}/downloadApp/`
  }

  if (!isShow) return null

  return (
    <div className={bannerStyles.banner}>
      <div className={bannerStyles.bannerInner}>
        <div className={bannerStyles.bannerLeft}>
          <div className={bannerStyles.bannerLogo}>
            <BannerAppLogo />
          </div>
          <div className={bannerStyles.bannerText}>
            <h1 className={bannerStyles.bannerBrand}>EasiCoin</h1>
            <p className={bannerStyles.bannerDesc}>{t('bannerTitle2')}</p>
          </div>
        </div>
        <div className={bannerStyles.bannerRight}>
          <div className={bannerStyles.bannerBtn} onClick={onDownload}>
            {t('download')}
          </div>
          <div className={bannerStyles.bannerClose} onClick={onClose}>
            <BannerCloseIcon />
          </div>
        </div>
      </div>
    </div>
  )
}

interface LargeFooterProps {
  showDownloadBanner?: boolean
}

export function LargeFooter({ showDownloadBanner = false }: LargeFooterProps) {
  const { t } = useI18n('footer')
  const { t: t1 } = useI18n()
  const { t: t2 } = useI18n('gitbook-url')
  const lang = useLanguageValue()
  const year = useMemo(() => getCurrentYear(), [])

  const [showDownBanner, setShowDownBanner] = useState(showDownloadBanner)
  const [communityMap, setCommunityMap] = useState<SocialMediaMap>({})
  const [qrcodeDataUrl, setQrcodeDataUrl] = useState('')
  const [numActive, setNumActive] = useState<Record<string, boolean>>({
    about: false,
    product: false,
    trade: false,
    services: false
  })

  useEffect(() => {
    getSocialMediaList()
      .then((res: any) => {
        if (res && Object.keys(res).length > 0) {
          setCommunityMap(res)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch social media list:', err)
      })
  }, [])

  useEffect(() => {
    const downloadUrl = isProd
      ? `${window.location.origin}/${lang}/downloadApp`
      : `https://www.test.bitrunfinance.com/${lang}/downloadApp`

    QRCode.toDataURL(downloadUrl, {
      width: 80,
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M'
    })
      .then(setQrcodeDataUrl)
      .catch((err) => console.error('Failed to generate QR code:', err))
  }, [lang])

  const getFeeUrl = () => {
    return 'https://easicoin.zendesk.com/hc/en-us/articles/13359248554767-EasiCoin-futures-transaction-fee-explanation'
  }

  const aboutList: MenuItem[] = useMemo(
    () => [
      { text: t('f_helpcenter'), url: t2('url-help-center') },
      { text: t('f_global_community'), url: `/${lang}/community` },
      { text: t('f_serviceterms'), url: t2('url-service-condition') },
      { text: t('f_privacyterms'), url: t2('url-privacy-policy') }
    ],
    [t2, lang]
  )

  const productList: MenuItem[] = useMemo(
    () => [
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
      { text: t('f_demo_trading'), url: `/${lang}/downloadApp/`, h5url: `/${lang}/downloadApp/` },
      { text: t('f_copy_trading'), url: `/${lang}/downloadApp/`, h5url: `/${lang}/downloadApp/` },
      { text: t('f_quick_buy'), url: `/${lang}/buy-crypto/`, h5url: `/${lang}/downloadApp/` },
      { text: 'APIs', url: `/${lang}/open-api/`, h5url: `/${lang}/downloadApp/` },
      {
        text: 'EasiCoin Card',
        url: `/${lang}/promotion/ucards`,
        h5url: `/${lang}/downloadApp/`,
        new: true
      }
    ],
    [t, lang]
  )

  const tradeList: MenuItem[] = useMemo(
    () =>
      TRADE_PRODUCTS.map((symbol) => ({
        text: `${t('f_buy')} ${symbol}`,
        url: `/${lang}/trade/usdt/${symbol}USDT`,
        h5url: `/${lang}/downloadApp/`
      })),
    [t, lang]
  )

  const serviceList: MenuItem[] = useMemo(
    () => [
      { text: t('f_standardRates'), url: getFeeUrl() },
      { text: t('f_proofOfReserves'), url: `/${lang}/proofOfReserves/` },
      { text: t('f_crypto_prices'), url: `/${lang}/markets` },
      { text: t('f_positionTiers'), url: `/${lang}/trading-data/position` },
      { text: t('f_position_params'), url: `/${lang}/trading-data/split-symbol-params` },
      { text: t('f_historical_mark_price'), url: `/${lang}/trading-data/price` },
      { text: t('f_index_price'), url: `/${lang}/trading-data/indexPrice` },
      { text: t('f_historical_funding_rate'), url: `/${lang}/trading-data/fundfee` },
      { text: t('f_riskReserve'), url: `/${lang}/trading-data/risk-reserve` }
    ],
    [t, lang]
  )

  const mediaLinks = useMemo(() => {
    // 获取当前语言的社交媒体数据，找不到则使用英文，再找不到则使用中文，最后使用兜底常量
    const getSocialUrl = (platform: string): string => {
      const localeSocial = communityMap[lang] || communityMap['en-US'] || communityMap['zh-CN']
      if (localeSocial?.social_medias) {
        const found = localeSocial.social_medias.find(
          (item) => item.name.toLowerCase() === platform.toLowerCase()
        )
        if (found?.redirect_url) return found.redirect_url
      }
      return SOCIAL_LINKS[platform]
    }

    return [
      { icon: <TwitterSvg />, url: getSocialUrl('x') },
      { icon: <TelegramSvg />, url: getSocialUrl('telegram') },
      { icon: <FacebookSvg />, url: getSocialUrl('facebook') },
      { icon: <DiscordSvg />, url: getSocialUrl('discord') },
      { icon: <InstagramSvg />, url: getSocialUrl('instagram') },
      { icon: <CommunitySvg />, url: `/${lang}/community` }
    ]
  }, [communityMap, lang])

  const renderMedias = () => (
    <>
      {mediaLinks.map((item, idx) => (
        <a key={idx} href={item.url} target="_blank" rel="noreferrer">
          <div className={styles.socialIcon}>{item.icon}</div>
        </a>
      ))}
    </>
  )

  const onCollapseChange = (key: string) => {
    setNumActive((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderMenuColumn = (title: string, list: MenuItem[], key: string) => (
    <div className={styles.menuColumn} key={key}>
      <h2 className={styles.menuTitle}>{title}</h2>

      <div className={styles.menuTitleH5} onClick={() => onCollapseChange(key)}>
        {title}
        {numActive[key] ? <CollapseActiveIcon /> : <CollapseNoActiveIcon />}
      </div>

      {numActive[key] &&
        list.map((item, i) => (
          <div key={i} className={styles.menuItemH5}>
            <a target="_self" rel="noreferrer" href={item.h5url || item.url}>
              {item.text}
              {item.new && <img className={styles.newBadgeH5} src={NEW_ICON} alt="new" />}
            </a>
          </div>
        ))}

      <div className={styles.menuListPc}>
        {list.map((item, i) => (
          <div key={i} className={styles.menuItemPc}>
            <a target="_blank" rel="noreferrer" href={item.url}>
              {item.text}
              {item.new && <img className={styles.newBadgePc} src={NEW_ICON} alt="new" />}
            </a>
            <FooterArrow className={styles.arrowIcon} />
          </div>
        ))}
      </div>
    </div>
  )

  const containerCls = showDownBanner
    ? `${styles.container} ${styles.withBanner}`
    : styles.container

  return (
    <div className={containerCls}>
      <div className={styles.h5Logo}>
        <LogoSVG />
      </div>

      <div className={styles.innerWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.menuColumns}>
            {renderMenuColumn(t('f_aboutus'), aboutList, 'about')}
            {renderMenuColumn(t('f_product'), productList, 'product')}
            {renderMenuColumn(t('f_trade'), tradeList, 'trade')}
            {renderMenuColumn(t('f_services'), serviceList, 'services')}
          </div>

          <div className={styles.rightSection}>
            <div className={styles.downloadSection}>
              <div className={styles.downloadTitle}>
                <p>{t('f_download_app_desc1')}</p>
                <p>{t('f_download_app_desc2')}</p>
              </div>
              <div className={styles.qrcodeWrapper}>
                {qrcodeDataUrl && (
                  <img
                    src={qrcodeDataUrl}
                    alt="Download QR Code"
                    className={styles.qrcodeImage}
                    style={{ height: 'auto', maxWidth: '100%' }}
                  />
                )}
              </div>
            </div>

            <div className={styles.communitySection}>
              <div className={styles.communityTitle}>{t('f_community')}</div>
              <div className={styles.socialLinks}>{renderMedias()}</div>
            </div>
          </div>
        </div>

        <div className={styles.h5Socials}>
          <div className={styles.h5SocialRow}>{renderMedias()}</div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.copyright}>{t1('copyrightText', { year })}</div>

      {showDownBanner && <DownloadBanner onHide={() => setShowDownBanner(false)} />}
    </div>
  )
}
