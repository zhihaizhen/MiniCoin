// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
// import getConfig from 'next/config';
import { Tabs, Skeleton } from 'antd';
import Cookie from 'js-cookie';
import type { TabsProps } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, getLang, isMobile } from '@better-bit-fe/base-utils';
import MultipleLogin from '~/components/multipleLogin';
import VertifyCode from '~/components/vertifyCode';
import Style from './index.module.less';
import queryString from 'query-string';

import { getBannerDetail } from '~/api';
import QrcodeLogin from '~/components/qrcodeLogin';
import Image from 'next/image';

import { ReactComponent as SwitchIcon } from '~/public/images/switch.svg';
import { useIntl } from 'react-intl';

// TMS 文案使用 HTML（<br /> / <b>）。FormatJS 会把自闭合 <br /> 当成字面量，需自行解析。
const renderTmsRichText = (message: string) => {
  if (!message) return null;
  const tokens = message.split(/(<br\s*\/?>|<\/?b>)/gi);
  let bold = false;
  return tokens.map((token, index) => {
    if (!token) return null;
    if (/^<br\s*\/?>$/i.test(token)) {
      return <br key={index} />;
    }
    if (/^<b>$/i.test(token)) {
      bold = true;
      return null;
    }
    if (/^<\/b>$/i.test(token)) {
      bold = false;
      return null;
    }
    if (bold) {
      return (
        <span key={index} className="text-text-brand-default">
          {token}
        </span>
      );
    }
    return <React.Fragment key={index}>{token}</React.Fragment>;
  });
};

// const { staticFolder } = getConfig().publicRuntimeConfig;
interface IMiniLoginProps {
  mode: 'login' | 'register';
  walletDetail: {
    visible: boolean;
    address: string;
  };
  changeWalletDetail: () => void;
  isBindMode?: boolean;
  fixedReferralCode?: string;
  isRestricted?: boolean;
  checkIpRestriction?: () => Promise<boolean>;
}

const MiniLogin: React.FC<IMiniLoginProps> = (props) => {
  const { mode, isBindMode, fixedReferralCode, isRestricted, checkIpRestriction } = props;
  const childRef = useRef();
  const isMb = isMobile();
  const t = useFm();
  const { messages } = useIntl();

  const [step, setStep] = useState(1); // 1表示注册或登录 2表示输入验证码
  const [pageInfos, setPageInfos] = useState({});
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [activeKey, setActiveKey] = useState<string>('1');
  const router = useRouter();
  const isOauth = router.isReady && router.query.isOauth;
  const handleChangeMode = () => {
    const lang = getLang();
    if (mode === 'login') {
      window.location.href = `/${lang}/account/register${window.location.search}`;
    } else {
      window.location.href = `/${lang}/account/login${window.location.search}`;
    }
  };

  const getNextInfo = (infos) => {
    const { step, type, account, areaCode } = infos;
    setStep(step);
    setPageInfos({
      type,
      account,
      areaCode
    });
  };

  const handleRegister = (code) => {
    const verify_code = code.join('');
    childRef?.current?.handleRegister(verify_code);
  };
  const [isShowDefaultPoster, setIsShowDefaultPoster] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  // 获取代理商banner图
  useEffect(() => {
    // if (mode !== 'register') {
    //   setIsShowDefaultPoster(true)
    //   return;
    // }
    const parsed = queryString.parse(location.search);
    const referralCode = fixedReferralCode ||
      parsed?.invite_code ||
      parsed?.inviteCode ||
      new URLSearchParams(window.location.search).get('inviteCode') ||
      new URLSearchParams(window.location.search).get('invite_code') ||
      Cookie.get('invite_code') ||
      Cookie.get('inviteCode');

    const parsedOauth = parsed.oauth;

    setReferralCode(referralCode);

    if (!referralCode) {
      setIsShowDefaultPoster(true);
      return;
    }
    setLoading(true)
    getBannerDetail(referralCode).then(res => {
      setIsShowDefaultPoster(!res || res?.default)
      setBannerUrl(isMb ? res?.appBannerUrl : res?.webBannerUrl)
      setLoading(false)
    })
  }, [mode, router.isReady]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: mode === 'login' ? t('login-emailTab') : t('signUp-emailTab'),
      children: (
        <MultipleLogin
          ref={childRef}
          mode={mode}
          type="email"
          getNextInfo={getNextInfo}
          isBindMode={isBindMode}
          fixedReferralCode={fixedReferralCode}
          isRestricted={isRestricted}
          checkIpRestriction={checkIpRestriction}
          active={activeKey === '1'}
        />
      )
    },
    {
      key: '2',
      label: mode === 'login' ? t('login-mobileTab') : t('signUp-mobileTab'),
      children: (
        <MultipleLogin
          ref={childRef}
          mode={mode}
          type="mobile"
          getNextInfo={getNextInfo}
          isBindMode={isBindMode}
          fixedReferralCode={fixedReferralCode}
          isRestricted={isRestricted}
          checkIpRestriction={checkIpRestriction}
          active={activeKey === '2'}
        />
      )
    },
    {
      key: '3',
      label: t('qrcode'),
      children: <QrcodeLogin active={activeKey === '3'} checkIpRestriction={checkIpRestriction} />
    }
  ];

  return (
    <div className={Style['mini-login']}>
      {
        !isOauth && router.isReady &&
        <div className={`${Style[!isShowDefaultPoster ? 'referral-poster-container' : 'poster-container']} ${Style[mode === 'login' ? 'login-poster' : 'register-poster']}`}>
          {
            isShowDefaultPoster &&
            <>
              <div className={Style['content']}>
                {
                  mode === 'login' &&
                  <div className={Style['header']}>
                    {renderTmsRichText(String(messages.loginPosterDesc ?? ''))}
                  </div>
                }
                {
                  mode === 'register' &&
                  <div className={Style['header']}>
                    {renderTmsRichText(String(messages.registerPosterDesc ?? ''))}
                  </div>
                }
                <div>
                  <div className={Style['posterCard']}>
                    <Image src={`${basePath}/images/${mode}-poster.png`} width={250} height={250} alt="poster" unoptimized />
                  </div>
                  <div className={Style['aperture']}>
                    <Image src={`${basePath}/images/aperture.png`} width={204} height={26} alt="poster" unoptimized />
                  </div>
                </div>

              </div>
            </>

          }

          {
            !isShowDefaultPoster && (
              loading ?
                (<div className={Style['loadingContainer']}>
                  <Skeleton.Image style={{ width: '100%', height: '100%' }} active={loading} />
                </div>)
                :
                (bannerUrl && <img src={bannerUrl} alt='poster' />)
            )
          }
        </div>
      }


      <div className={Style['login-container']}>
        <div className={Style['left-part']}>
          <div className={step === 2 ? Style.disVisible : undefined}>
            <div className={Style.titleContainer}>
              <span className={Style.title}>
                {isBindMode ? t('bindAccount') : (mode === 'register' ? t('signup-title') : t('title-welcome'))}
              </span>
              {!isBindMode && !fixedReferralCode && (
                <span className={Style.switchBtn} onClick={handleChangeMode}>
                  <SwitchIcon />
                  <span>{mode === 'login' ? t('signUpBtn') : t('loginBtn')}</span>
                </span>
              )}
            </div>
            <Tabs defaultActiveKey="1" items={isMb || mode === 'register' ? items.slice(0, 2) : items} onChange={(activeKey) => setActiveKey(activeKey)} />
          </div>

          {step === 2 && (
            <VertifyCode handleRegister={handleRegister} {...pageInfos} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniLogin;
