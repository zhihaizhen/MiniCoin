// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { ConfigProvider, Skeleton, theme } from 'antd';
import getConfig from 'next/config';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { CaptchaProvider } from '~/context/captchaContext';
import { getTmsMessages } from '@better-bit-fe/lang';
import ResetPwd from '~/containers/resetPwd';
import Style from './index.module.less';
import queryString from 'query-string';
import Cookie from 'js-cookie';
import { getBannerDetail } from '~/api';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { AntThemeConfig } from '~/constants';
import Image from 'next/image';
import { basePath } from '@better-bit-fe/base-utils';
import { useRouter } from 'next/router';

const { staticFolder } = getConfig().publicRuntimeConfig;

const ResetPage = () => {
  const router = useRouter();
  useGlobalWidget({
    isHideFooter: router.isReady && router.query.isOauth,
    isHideHeader: router.isReady && router.query.isOauth
  });

  const t = useFm();
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShowDefaultPoster, setIsShowDefaultPoster] = useState(false);


  // 获取代理商banner图
  useEffect(() => {
    const parsed = queryString.parse(location.search);
    const referralCode =
      parsed?.invite_code ||
      parsed?.inviteCode ||
      new URLSearchParams(window.location.search).get('inviteCode') ||
      new URLSearchParams(window.location.search).get('invite_code') ||
      Cookie.get('invite_code') ||
      Cookie.get('inviteCode');
    if (!referralCode) {
      setIsShowDefaultPoster(true);
      return;
    }
    setLoading(true)
    getBannerDetail(referralCode).then(res => {
      setIsShowDefaultPoster(!res)
      setBannerUrl(res)
      setLoading(false)
    })
  }, []);
  return (
    <div className={Style['resetPage']}>
      <ConfigProvider theme={AntThemeConfig} autoInsertSpaceInButton={false}>
        <CaptchaProvider>
          <div className={Style['wrapper']}>
            {
              router.isReady && !router.query.isOauth && (
                <div className={Style['poster-container']}>
                  {
                    isShowDefaultPoster &&
                    <div className={Style['content']}>
                      <div className={Style['header']}>
                        <h1>{t('loginPosterTitle')}</h1>
                        <h1 dangerouslySetInnerHTML={{ __html: t('loginPosterSubTitle', { usdt: '<span> 1,000 USDT </span>' }) }}></h1>
                      </div>
                      <div>
                        <div className={Style['posterCard']}>
                          <Image src={`${basePath}/images/login-poster.png`} width={250} height={250} alt="poster" unoptimized />
                        </div>
                        <div className={Style['aperture']}>
                          <Image src={`${basePath}/images/aperture.png`} width={204} height={26} alt="poster" unoptimized />
                        </div>
                      </div>
                    </div>
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
              )
            }

            <div className={Style['reset-container']}>
              <ResetPwd />
            </div>
          </div>
          <Chat />
        </CaptchaProvider>
      </ConfigProvider>
    </div>
  );
};

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['user-login', 'error_code', 'footer'],
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
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withLayout(ResetPage);
