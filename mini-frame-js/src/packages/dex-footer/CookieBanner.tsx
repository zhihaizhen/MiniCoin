import React from 'react'
import { useI18n } from '@/utils/i18n'
import styles from './styles/cookieConsent.module.less'

interface CookieBannerProps {
  onAcceptAll: () => void
  onRejectAll: () => void
  onOpenSettings: () => void
  closing?: boolean
}

export function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onOpenSettings,
  closing
}: CookieBannerProps) {
  const { t } = useI18n('footer')
  const { t: tUrl } = useI18n('gitbook-url')

  const cookiePolicyUrl = tUrl('url-privacy-policy')

  const bannerCls = closing ? `${styles.banner} ${styles.bannerClosing}` : styles.banner

  return (
    <div className={bannerCls}>
      <div>
        <p className={styles.bannerTitle}>{t('cookie_banner_title')}</p>
        <p
          className={styles.bannerDesc}
          style={{ marginTop: 12 }}
          dangerouslySetInnerHTML={{
            __html: t('cookie_banner_desc', {
              policy: `<a class="${styles.bannerLink}" href="${cookiePolicyUrl}" target="_blank" rel="noreferrer">`
            })
          }}
        />
      </div>
      <div className={styles.bannerButtons}>
        <button className={styles.btnPrimary} onClick={onAcceptAll}>
          {t('cookie_banner_accept_all')}
        </button>
        <div>
          <button className={styles.btnSecondary} onClick={onRejectAll}>
            {t('cookie_banner_reject_all')}
          </button>
          <div className={styles.bannerSettingsLink} onClick={onOpenSettings}>
            {t('cookie_banner_settings')}
          </div>
        </div>
      </div>
    </div>
  )
}
