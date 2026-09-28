import React, { useMemo } from 'react'
import { useI18n } from '@/utils/i18n'
import { getCurrentYear } from '@/utils'
import styles from './styles/small.module.less'

export function SmallFooter() {
  const { t } = useI18n()
  const year = useMemo(() => getCurrentYear(), [])

  return (
    <div className={styles.footer}>
      <div className={styles.copyright}>{t('copyrightText', { year })}</div>
    </div>
  )
}

