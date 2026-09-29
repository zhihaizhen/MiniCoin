// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { tracing } from '@better-bit-library/tools';
import getConfig from 'next/config';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { useMobileDetection, useDropdown, useClientSide, useReserveData, useAuditDateOptions, type ReserveData } from '~/hooks/proofOfReserves';
import { AuditDateDropdown } from './AuditDateDropdown';
import styles from '~/pages/proofOfReserves/index.module.less';

const { staticFolder } = getConfig().publicRuntimeConfig;

export function ProofOfReservesPage() {
  const t = useFm();
  const { locale } = useRouter();
  const [auditDate, setAuditDate] = useState('');

  const isMobileDevice = useMobileDetection();
  const isClient = useClientSide();
  const { isOpen: isDropdownOpen, dropdownRef, toggle: handleDropdownToggle, close: closeDropdown } = useDropdown();
  const { auditDates: auditDateOptions, loading: auditDatesLoading } = useAuditDateOptions();
  const { reserveData, loading: reserveDataLoading, } = useReserveData(auditDate);

  const symbolData = [
    {
      symbol: 'USDT',
      name: 'Tether',
      iconName: 'usdt',
      key: 'usdtPercentage'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      iconName: 'usdc',
      key: 'usdcPercentage'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      iconName: 'eth',
      key: 'ethPercentage'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      iconName: 'btc',
      key: 'btcPercentage'
    }
  ]

  // 当接口数据加载完成后，自动选择第一个日期
  useEffect(() => {
    if (!auditDatesLoading && auditDateOptions.length > 0 && auditDate === '') {
      setAuditDate(auditDateOptions[0]);
    }
  }, [auditDatesLoading, auditDateOptions, auditDate]);

  // useEffect(() => {
  //   tracing.init({
  //     project_type: 'ProofOfReserves',
  //     project_name: 'ProofOfReservesPage'
  //   });
  //   tracing.push('event', 'PageView', {});
  // }, []);

  useGlobalWidget();

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section
        className={styles.heroSection}
      >
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t('hero-title')}</h1>
            <p className={styles.heroDescription}>{t('hero-description')}</p>
          </div>
          <img
            src={`${staticFolder}/images/proofOfReserves/symbol.png`}
            alt="symbol"
            className={styles.symbolImage}
          />
        </div>
      </section>

      {/* Reserve Ratio Section */}
      <section className={styles.reserveSection}>
        <div className={styles.reserveContainer}>
          <div className={styles.auditDateSection}>
            <h2 className={styles.reserveTitle}> {t('reserve-ratio')}</h2>

            {/* PC端布局 */}
            <div className={styles.pcLayout}>
              <AuditDateDropdown
                auditDate={auditDate}
                auditDateOptions={auditDateOptions}
                isDropdownOpen={isDropdownOpen}
                isMobileDevice={isMobileDevice}
                dropdownRef={dropdownRef}
                onToggle={handleDropdownToggle}
                onSelect={setAuditDate}
                onClose={closeDropdown}
              />
            </div>

            {/* 移动端布局 */}
            <div className={styles.mobileLayout}>
              <p className={styles.reserveDescription}>
                {t('reserve-description')}
              </p>

              <AuditDateDropdown
                auditDate={auditDate}
                auditDateOptions={auditDateOptions}
                isDropdownOpen={isDropdownOpen}
                isMobileDevice={isMobileDevice}
                dropdownRef={dropdownRef}
                onToggle={handleDropdownToggle}
                onSelect={setAuditDate}
                onClose={closeDropdown}
              />
            </div>
          </div>

          {/* PC端的描述文字 */}
          <div className={styles.pcDescription}>
            <p className={styles.reserveDescription}>
              {t('reserve-description')}
            </p>
          </div>

          <div className={styles.reserveGrid}>
            {
              symbolData.map((item, index) => (
                <div key={index} className={styles.reserveCard}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardHeader}>
                      <span className={styles.tokenSymbol}>{item.symbol}</span>
                      <span className={styles.tokenName}>{item.name}</span>
                    </div>
                    <div className={styles.ratioSection}>
                      <span className={styles.ratioLabel}>
                        {t('reserve-ratio')}
                      </span>
                      <span className={styles.ratioValue}> {reserveData[item.key] && Number(reserveData[item.key]) > 0
                        ? `${(Number(reserveData[item.key]) * 100).toFixed(0)}%`
                        : reserveData[item.key]
                      }</span>
                    </div>
                  </div>
                  <div className={styles.tokenIconContainer}>
                    <img
                      src={getSymbolUrl(item.iconName)}
                      alt={`${item.symbol} Icon`}
                      className={styles.tokenIcon}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.featuresGrid}>
            {/* Left Card */}
            <div className={`${styles.featureCard} ${styles.leftCard}`}>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{t('left-card-title')}</h3>
                <p className={styles.cardDescription}>
                  {t('left-card-description')}
                </p>
              </div>
              <div className={styles.cardImageContainer}>
                <img
                  src={`${staticFolder}/images/proofOfReserves/icon_bg.png`}
                  alt="Security Shield"
                  className={styles.cardImage}
                />
              </div>
            </div>

            {/* Right Card */}
            <div className={`${styles.featureCard} ${styles.rightCard}`}>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{t('right-card-title')}</h3>
                <p className={styles.cardDescription}>
                  {t('right-card-description')}
                </p>
              </div>
              <div className={styles.cardImageContainer}>
                <img
                  src={`${staticFolder}/images/proofOfReserves/icon2_bg.png`}
                  alt="Trust Icon"
                  className={styles.cardImage}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is PoR Section */}
      <section className={styles.porSection}>
        <div className={styles.porContainer}>
          <h2 className={styles.porTitle}>{t('por-title')}</h2>

          <div className={styles.porContent}>
            <div className={styles.porItem}>
              <span className={styles.bullet}>•</span>
              <p>{t('por-content-1')}</p>
            </div>

            <div className={styles.porItem}>
              <span className={styles.bullet}>•</span>
              <p>{t('por-content-2')}</p>
            </div>

            <div className={styles.porItem}>
              <span className={styles.bullet}>•</span>
              <p>{t('por-content-3')}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
