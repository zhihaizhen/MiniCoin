import React, { useState } from 'react'
import { useI18n } from '@/utils/i18n'
import styles from './styles/cookieConsent.module.less'
import { CloseIcon, CheckIcon } from './icons'

interface CookieSettingsProps {
  onSave: () => void
  onClose: () => void
  closing?: boolean
}

export function CookieSettings({ onSave, onClose, closing }: CookieSettingsProps) {
  const { t } = useI18n('footer')
  const { t: tUrl } = useI18n('gitbook-url')

  const [checked, setChecked] = useState<Record<string, boolean>>({
    core: true,
    marketing: false,
    analytics: false
  })

  const cookiePolicyUrl = tUrl('url-privacy-policy')

  const toggleCheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const wrapperCls = closing
    ? `${styles.settingsWrapper} ${styles.settingsClosing}`
    : styles.settingsWrapper

  const sections = [
    {
      key: 'core',
      label: t('cookie_core_label'),
      desc: t('cookie_core_desc'),
      detail: t('cookie_core_detail'),
      alwaysChecked: true
    },
    {
      key: 'marketing',
      label: t('cookie_marketing_label'),
      desc: t('cookie_marketing_desc'),
      detail: t('cookie_marketing_detail'),
      alwaysChecked: false
    },
    {
      key: 'analytics',
      label: t('cookie_analytics_label'),
      desc: t('cookie_analytics_desc'),
      detail: t('cookie_analytics_detail'),
      alwaysChecked: false
    }
  ]

  return (
    <div className={wrapperCls}>
      <div className={styles.overlay} />
      <div className={styles.settings}>
        <div className={styles.settingsHead}>
          <span className={styles.settingsTitle}>{t('cookie_settings_title')}</span>
          <div className={styles.settingsClose} onClick={onClose}>
            <CloseIcon />
          </div>
        </div>

        <div className={styles.settingsBody}>
          <div className={styles.settingsInner}>
            <p
              className={styles.settingsDesc}
              dangerouslySetInnerHTML={{
                __html: t('cookie_settings_desc', {
                  policy: `<a class="${styles.bannerLink}" href="${cookiePolicyUrl}" target="_blank" rel="noreferrer">`
                })
              }}
            />

            {sections.map((section) => {
              const isChecked = section.alwaysChecked || checked[section.key]
              const checkboxCls = [
                styles.checkbox,
                isChecked ? styles.checkboxChecked : '',
                section.alwaysChecked ? styles.checkboxDisabled : ''
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div className={styles.section} key={section.key}>
                  <div className={styles.checkboxRow}>
                    <div
                      className={checkboxCls}
                      onClick={() => !section.alwaysChecked && toggleCheck(section.key)}
                    >
                      {isChecked && <CheckIcon />}
                    </div>
                    <span className={styles.checkboxLabel}>{section.label}</span>
                  </div>
                  <p className={styles.sectionDesc}>{section.desc}</p>
                  <div className={styles.sectionDetail}>
                    <p>{section.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.settingsFooter}>
          <button className={styles.btnPrimary} onClick={onSave}>
            {t('cookie_settings_save')}
          </button>
        </div>
      </div>
    </div>
  )
}
