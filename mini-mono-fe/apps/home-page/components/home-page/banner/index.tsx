//@ts-ignore
import React, { useEffect, useState } from 'react';
import cls from 'classnames';
import { Input, Button } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { getLang } from '@better-bit-fe/base-utils';
import { ReactComponent as IconGift } from '~/public/images/homePage/gift.svg';
import { isMobile } from '@betterbit-library/tools';
import { useUserInfo } from '@better-bit-fe/base-provider';
import DownloadIcons from '~/components/downloadIcons';
import styles from './index.module.less';
import { useRouter } from 'next/router';
import { WebmAnimation } from '@better-bit-fe/base-ui';
import { FormattedMessage } from 'react-intl';
import { useCampaignBanner } from '~/hooks/useCampaignBanner';


const brandHighlight = (chunks: React.ReactNode) => (
  <span className="text-text-brand-default">{chunks}</span>
);

const HomeBanner = () => {
  const t = useFm();
  const isMb = isMobile();
  const { locale } = useRouter();
  const { isLogin } = useUserInfo();
  const [inputValue, setInputValue] = useState('');
  const { data, loading } = useCampaignBanner();
  const { mainTitle, subTitle, entryVideoUrl, loopVideoUrl, loopVideoUrlH5, picUrl, picH5Url, redirectUrl, redirectH5Url } = data;

  const goToRegister = (username?: string) => {
    const query = username ? `?username=${username}` : '';
    window.location.href = `/${getLang()}/account/register${query}`;
  };

  const handleSubmit = () => {
    if (isLogin) {
      window.location.href = `/${getLang()}/trade/usdt/BTCUSDT`;
    } else {
      goToRegister(inputValue.trim());
    }
  };

  const handleBannerClick = () => {
    if (!redirectUrl) return;
    window.location.href = `/${getLang()}/${isMb ? redirectH5Url : redirectUrl}`;
  };

  return (
    <section className={styles.homeBanner}>
      <div className={styles.videoContent} onClick={handleBannerClick}>
        {loopVideoUrl ? (
          <>
            <WebmAnimation className="md:hidden w-full h-full" loopSrc={loopVideoUrlH5} />
            <WebmAnimation
              className="hidden md:block h-[800px] w-full"
              loopSrc={loopVideoUrl}
              introSrc={entryVideoUrl}
            />
          </>
        ) : picUrl ? (
          <>
            <img src={picUrl} alt="banner" className="hidden! md:block! w-full h-[500px] object-contain" />
            <img src={picH5Url || picUrl} alt="banner" className="md:hidden! w-full h-[400px] object-contain" />
          </>
        ) : null}
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className="text-text-primary text-3xl md:text-[40px] font-bold">
            {!loading && (
              <FormattedMessage
                id="home-page-title-static"
                defaultMessage={mainTitle}
                values={{ i: brandHighlight }}
              />
            )}
          </div>

          <div className={styles.formBlock}>
            <div className={styles.promoBanner}>
              <IconGift className={styles.giftIcon} />
              <a
                href={`/${locale}/rewards-hub`}
                target="_blank"
                className={styles.promoText}
                rel="noreferrer"
              >
                {!loading && (
                  <FormattedMessage
                    id="home-page-subtitle-static"
                    defaultMessage={subTitle}
                    values={{ i: brandHighlight }}
                  />
                )}
              </a>
            </div>

            <div className={cls(styles.managerWrapper, { [styles.managerWrapperLogin]: isLogin })}>
              {isLogin === false && (
                <div className={styles.inputWrapper}>
                  <Input
                    className={styles.emailInput}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t('number/email')}
                  />
                  <Button className={styles.submitButton} onClick={handleSubmit}>
                    {t('signUp')}
                  </Button>
                </div>
              )}

              {isLogin && (
                <Button className={cls(styles.submitButton, styles.tradeButton)} onClick={handleSubmit}>
                  {t('rightNowTrade', '立即交易')}
                </Button>
              )}

              {isLogin === undefined && <div className={styles.loading} />}

              <div className={cls(styles.downloadBlock, { [styles.downloadBlockLogin]: isLogin })}>
                <DownloadIcons theme="dark_round" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
