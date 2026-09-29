import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isMobile, isApp } from '@better-bit-fe/base-utils';
import getConfig from 'next/config';
import styles from './index.module.less';
import cls from 'classnames';
import { postWealthTracking } from '~/api';

import { checkType } from '@better-bit-fe/base-utils';
import { ReactComponent as APKSvg } from '~/icon/app/wealthVip/androidIcon.svg';
import { ReactComponent as AppStoreSVG } from '~/icon/app/wealthVip/appIcon.svg';
import { ReactComponent as TestFlightSVG } from '~/icon/app/wealthVip/tf.svg';
import { message } from 'antd';

const { staticFolder } = getConfig().publicRuntimeConfig;

const translations: Record<string, any> = {
  'zh-CN': {
    copySuccess: '邀请码已复制',
    title1: '炒股 T+1，收盘即停？',
    title2: '加密资产 7x24 小时，',
    title3: '全天候交易！',
    vsTitle: '传统股票交易平台 VS EasiCoin 交易平台',
    vsDesc1: '1.加密资产 24 小时全天交易，T+0 实时成交，多空双向',
    vsDesc2: '2.随买随卖，资金灵活周转',
    vsDesc3: '3.美股、贵金属、现货、合约、理财，一站搞定',
    vsDesc4: '4.炒股式极简界面，指标通用易上手',
    vsDesc5Part1: '5.股民专属开户权益：交易手续费',
    vsDesc5Highlight: '永久返佣 40%',
    vsDesc5Part2: '，交易成本更低',
    safeTitle: 'EasiCoin 平台合规，资金安全',
    safeDesc1Part1: '1.拥有美国 MSB，加拿大 MSB 数字金融交易',
    safeDesc1Highlight: '双牌照',
    safeDesc2Part1: '2.全球加密货币交易平台综合排名',
    safeDesc2Highlight: '前 30',
    safeDesc3: '3.行业顶级撮合引擎，交易流畅不卡顿',
    safeDesc4: '4.冷热钱包分离存储，多重签名资产管理，用户资产双保障',
    welfareTitle: '开户专属福利',
    welfareDescPart1: '现在注册，即享交易手续费 ',
    welfareDescHighlight1: '40% 永久返佣',
    welfareDescPart2: '更有 ',
    welfareDescHighlight2: '10,000 USDT ',
    welfareDescPart3: '福利活动等你参与',
    globalDesc1: '全球千万用户选择。',
    globalDesc2: '立即行动，把握全球市场机会。',
    inviteCodePrefix: '您的专属邀请码',
    copyBtn: '复制',
    androidDownload: 'Android APK 下载',
    tfDownload: 'Testflight 下载',
    appStoreDownload: 'App Store 下载',
    register: '立即注册'
  },
  'en-US': {
    copySuccess: 'Invitation code copied',
    title1: 'Stock trading still T+1?',
    title2: 'Stops at market close?',
    title3: 'Trading 24/7 with EasiCoin!',
    vsTitle: 'Traditional stock trading VS EasiCoin trading',
    vsDesc1: '1. Crypto assets traded 24/7, T+0 real-time settlement, both long and short',
    vsDesc2: '2. Buy and sell 24/7, flexible capital turnover',
    vsDesc3: '3. US stocks, commodities, spot, futures, wealth management, all in one site',
    vsDesc4: '4. Common stock trading interface, easy to use and trade',
    vsDesc5Part1: '5. Exclusive account opening rights for new users: ',
    vsDesc5Highlight: '40% permanent commission',
    vsDesc5Part2: ', lower trading costs and fees',
    safeTitle: 'Compliant platform with secure funds',
    safeDesc1Part1: '1. Holding US MSB and Canadian MSB digital financial trading ',
    safeDesc1Highlight: 'dual Certification licenses',
    safeDesc2Part1: '2. Global cryptocurrency trading platform, comprehensive ranking ',
    safeDesc2Highlight: 'top 30',
    safeDesc3: '3. Top matching engine system, flexible trading without lag',
    safeDesc4: '4. Hot and cold wallet separation storage, multi-signature asset management, enhanced protection for user assets',
    welfareTitle: 'Benefits for New Users',
    welfareDescPart1: 'Register now and enjoy a ',
    welfareDescHighlight1: '40% permanent commission',
    welfareDescPart2: ' on trading fees. ',
    welfareDescHighlight2: '10,000 USDT ',
    welfareDescPart3: 'reward activities waiting for you to join and claim.',
    globalDesc1: 'Chosen by millions of users worldwide.',
    globalDesc2: 'Register now and seize more global market opportunities.',
    inviteCodePrefix: 'Your invitation code',
    copyBtn: 'Copy',
    androidDownload: 'Android APK',
    tfDownload: 'Testflight',
    appStoreDownload: 'App Store',
    register: 'Register Now'
  }
};

export default function WealthVip() {

  const { query, isReady, locale } = useRouter();
  const currentLocale = locale === 'zh-CN' ? 'zh-CN' : 'en-US';
  const t = translations[currentLocale] || translations['en-US'];
  const { identity_id, device_model } = query;
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);

  const handleGoRegisterPage = () => {
    const registerUrl = `/${locale}/account/register/wealth?identity_id=${identity_id || '0'}&device_model=${device_model || 'default'}`;
    window.location.href = registerUrl;
  }

  const handleDownloadApk = () => {
    handleTracking('wealth_download_apk');
    const link = document.createElement('a');
    link.href = 'https://h5.nrkbl.com/download/apk/cn?_=' + Date.now();
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTracking = async (type, event?) => {
    event?.preventDefault();
    const params = {
      "product": "wealth_banner", //产线名称
      "event_name": type,  // "wealth_download_tf | wealth_download_appStore| wealth_download_apk | wealth_page_view", //事件名称，建议使用小写字母和下划线 
      "identity_id": identity_id || '0', //唯一标识符，比如设备ID，外部用户ID，或者本地cookie存储的ID，建议使用字符串类型
      "timestamp": Date.now(), //上报时间，入库统计UTC0时间
      "source_plat": checkType() === "pc" ? "pc" : "h5", //数据来源，建议使用小写字母 ios android web h5等
      "sdk_version": "1.0.0", //版本号，用于区分不同版本的上报数据
      "device_model": device_model || 'default', //设备型号
    }
    try {
      await postWealthTracking(params);
    } catch (error) {
      console.log('error tracking', error);
    } finally {
      if (type === 'wealth_download_tf') {
        window.open("https://testflight.apple.com/join/ZWY3thAf", "_blank");
      }
      if (type === 'wealth_download_appStore') {
        window.open('https://apps.apple.com/app/easicoin/id6747739506', "_blank");
      }
    }
  }

  const handleCopy = () => {
    copy('WEALTH');
    message.success({
      style: { marginTop: '30vh' },
      content: t.copySuccess,
    });
  }

  useEffect(() => {
    if (checkType() == 'ios') setIos(true);
    if (checkType() == 'android') setAndroid(true);
  }, []);
  useEffect(() => {
    if (!isReady) return;
    const params = {
      "product": "wealth_banner", //产线名称
      "event_name": "wealth_page_view",  // "wealth_download_tf | wealth_download_appStore| wealth_download_apk | wealth_page_view", //事件名称，建议使用小写字母和下划线 
      "identity_id": identity_id || '0', //唯一标识符，比如设备ID，外部用户ID，或者本地cookie存储的ID，建议使用字符串类型
      "timestamp": Date.now(), //上报时间，入库统计UTC0时间
      "source_plat": checkType() === "pc" ? "pc" : "h5", //数据来源，建议使用小写字母 ios android web h5等
      "sdk_version": "1.0.0", //版本号，用于区分不同版本的上报数据
      "device_model": device_model || 'default', //设备型号
    }
    postWealthTracking(params);
  }, [isReady]);

  return (
    <>
      <div className={styles.logoContainer}>
        <img
          src={`${staticFolder}/images/wealthVip/logo.svg`}
          alt="logo"
        />
        EasiCoin
        <img
          src={`${staticFolder}/images/wealthVip/x.svg`}
          alt="x"
          style={{ margin: '0 8px' }}
        />
        <img
          src={`${staticFolder}/images/wealthVip/wealthLogo.svg`}
          alt="wealthLogo"
        />
        Wealth ONE
      </div>

      <div className={styles.banner}>
        <img
          src={`${staticFolder}/images/wealthVip/wealthBanner.png`}
          alt="wealthBanner"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.contentTitle}>
          <span>{t.title1}</span><br />
          <span>{t.title2}</span><br />
          <span>{t.title3}</span>
        </div>

        <div className={styles.contentDesc}>
          <div className={styles.contentDescTitle}>
            <img src={`${staticFolder}/images/wealthVip/logoBlack.svg`} alt="logoBlack" style={{ height: 12 }} />
            <span style={{ marginLeft: 6 }}>{t.vsTitle}</span>
          </div>
          <div className={styles.contentDescList}>
            <div className={styles.contentDescListInner}>
              {t.vsDesc1}<br />
              {t.vsDesc2}<br />
              {t.vsDesc3}<br />
              {t.vsDesc4}<br />
              {t.vsDesc5Part1}<span className={styles.highlight}>{t.vsDesc5Highlight}</span>{t.vsDesc5Part2}
            </div>
          </div>
        </div>

        <div className={styles.contentDesc}>
          <div className={styles.contentDescTitle}>
            <img src={`${staticFolder}/images/wealthVip/logoBlack.svg`} alt="logoBlack" style={{ height: 12 }} />
            <span style={{ marginLeft: 6 }}>{t.safeTitle}</span>
          </div>
          <div className={styles.contentDescList}>
            <div className={styles.contentDescListInner}>
              {t.safeDesc1Part1}<span className={styles.highlight}>{t.safeDesc1Highlight}</span><br />
              {t.safeDesc2Part1}<span className={styles.highlight}>{t.safeDesc2Highlight}</span><br />
              {t.safeDesc3}<br />
              {t.safeDesc4}
            </div>
          </div>
        </div>

        <div className={styles.awardDesc}>
          <img
            src={`${staticFolder}/images/wealthVip/leafRight.svg`}
            alt="leafRight"
          />
          <div className={styles.awardDescContent}>
            <div className={styles.awardDescTitle}>{t.welfareTitle}</div>
            <div className={styles.awardDescText}>{t.welfareDescPart1}<span className={styles.highlight}>{t.welfareDescHighlight1}</span> <br />{t.welfareDescPart2}<span className={styles.highlight}>{t.welfareDescHighlight2}</span>{t.welfareDescPart3}</div>
          </div>
          <img
            src={`${staticFolder}/images/wealthVip/leafLeft.svg`}
            alt="leafLeft"
          />
        </div>

        <img style={{ width: 40 }} src={`${staticFolder}/brand.png`} alt="brand" />

        <div className={styles.globalDesc}>
          {t.globalDesc1}<br />
          {t.globalDesc2}
        </div>

        <div className={styles.stickFooterContainer}>
          {/* 安卓，下载apk和google市场 */}
          <div className={cls(styles.inviteCodeContainer, styles.downloadBtn)}>
            <span>{t.inviteCodePrefix}</span>
            <span>WEALTH</span>
            <span className={styles.copyBtn} onClick={handleCopy}>{t.copyBtn}</span>
          </div>
          <div className={styles.stickFooter}>
            <a
              className={`${styles.downloadBtn} ${styles.downloadAndroid}`}
              href="javascript:void(0)"
              rel="noreferrer"
              onClick={handleGoRegisterPage}>
              <div>{t.register}</div>
            </a>
          </div>
          {/* {android && (<div className={styles.stickFooter}>
            <a
              className={`${styles.downloadBtn} ${styles.downloadAndroid}`}
              href="javascript:void(0)"
              rel="noreferrer"
              onClick={handleDownloadApk}>
              <APKSvg />
              <div>{t.androidDownload}</div>
            </a>
          </div>)} */}

          {/* ios testflight&apple store*/}
          {/* {ios && (
            <div className={styles.stickFooter}>
              <a className={`${styles.downloadBtn} ${styles.downloadIos}`}
                href="https://testflight.apple.com/join/ZWY3thAf"
                onClick={(event) => handleTracking('wealth_download_tf', event)}
                target="_blank"
                rel="noreferrer"
              >
                <TestFlightSVG />
                <div>{t.tfDownload}</div>
              </a>
              <a className={`${styles.downloadBtn} ${styles.downloadIos}`}
                href='https://apps.apple.com/app/easicoin/id6747739506'
                onClick={(event) => handleTracking('wealth_download_appStore', event)}
                target="_blank"
                rel="noreferrer"
              >
                <AppStoreSVG />
                <div>{t.appStoreDownload}</div>
              </a>
            </div>
          )} */}
        </div>

      </div>

    </>
  );
}
