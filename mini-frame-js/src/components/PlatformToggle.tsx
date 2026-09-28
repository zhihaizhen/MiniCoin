import React from 'react'
// import pushEvent from '@region/by-gtm'
import { getLanguage } from '@region-lib/language'
import { Env, urlInfo, getHosts } from '@region-lib/env'
import styles from './PlatformToggle.module.less'

const { MAIN_HOST } = Env

interface PlatformToggleProps {
  platform: 'CEX' | 'DEX'
}

const platforms = [
  {
    platform: 'CEX' as const,
    host: () => MAIN_HOST.replace(urlInfo.domainType, 'com').replace('better-dex-1','better-1') + '/' + getLanguage(),
    gtmCategory: 'CEX Transaction Mode'
  },
  {
    platform: 'DEX' as const,
    host: () => MAIN_HOST.replace(urlInfo.domainType, 'com') + '/' + getLanguage() + '/dex',
    gtmCategory: 'DEX Transaction Mode'
  }
]

function goto(params: typeof platforms[0], currentPlatform: 'CEX' | 'DEX') {
  if (params.platform === currentPlatform) return
  // pushEvent('click', params.gtmCategory)
  window.location.href = params.host()
}

export default function PlatformToggle({ platform }: PlatformToggleProps) {
  return (
    <div className={styles.toggle}>
      {platforms.map((item) => (
        <a
          key={item.platform}
          className={item.platform === platform ? styles.active : ''}
          href={item.host()}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            goto(item, platform)
          }}
          rel="noopener"
          target="_self"
        >
          {item.platform}
        </a>
      ))}
    </div>
  )
}

