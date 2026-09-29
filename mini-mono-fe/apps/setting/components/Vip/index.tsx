// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Select, Table, Spin } from 'antd';
import { ActionSheet } from 'antd-mobile';
import { overseaData, hanData } from '~/constant'
import styles from './index.module.less';
import SymbolFetch from '@region-lib/symbol-fetch';
import { formatThousandDigit } from '~/utils';
import { useFm } from '@better-bit-fe/base-hooks';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { isMobile } from '@better-bit-fe/base-utils';
// import { ReactComponent as VipHeader } from '../../public/images/vip-header.svg';

const Vip = () => {
  const [loading, setLoading] = useState(true);
  const t = useFm();
  const { query } = useRouter();

  const { user_area = 'oversea' } = query;
  const data = user_area === 'han' ? hanData : overseaData;

  // vip等级从url的参数中获取
  const vipLevelFromQuery = +query.vip_level || 0;
  const vipLevel = vipLevelFromQuery === 0 ? t('originalUser') : t('vipUser');
  const futuresFeeList = data[vipLevelFromQuery]?.futuresFee.split('/');

  const futureMakerFee = futuresFeeList[0]
  const futureTakerFee = futuresFeeList[futuresFeeList.length - 1]

  const columns = [
    {
      title: t('level'),
      dataIndex: 'level',
      render: (_, record, index) => (
        <div className={styles['list-item-title']}>
          <div
            className={cls(styles.crown, styles[`crown-${index === 0}`])}
          ></div>
          <span>{t(record.level)}</span>
          {index === vipLevelFromQuery && (
            <div className={styles['level-tips']}>{t('current-level')}</div>
          )}
        </div>
      )
    },
    {
      title: t('trading-volume'),
      key: 'tradingVolume',
      render: (_, record) => <span>{record.tradingVolume}</span>
    },
    {
      title: t('vip-futures-fee'),
      key: 'futuresFee',
      render: (_, record) => <span>{record.futuresFee}</span>
    },
    {
      title: t('vip-spot-fee'),
      key: 'spotFee',
      render: (_, record) => <span>{record.spotFee}</span>
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className={styles['container']} style={{ height: '100vh' }}>
        <div className={styles['loading-box']}>
          {/* <div className={styles['img']}></div> */}
          <Spin size="large" />
        </div>
      </div>
    );
  }


  if (isMobile()) {
    return (
      <div className={styles['container']}>
        <div className={cls(styles['header'], 'banner-theme-dark')}>
          <div className={styles['core']}>
            <div className={styles['header-text']}>
              <div className={styles['vip-current-level']}>{t('current-level')}</div>

              <div className={cls(styles['vip-current-title'], {
                [styles.common]: vipLevel === t('originalUser')

              })}>{vipLevel}</div>

            </div>
            <div className={styles['header-img']}></div>
          </div>
        </div>

        <div className={styles['content']}>
          <div className={styles['title']}>
            <span>{t('current-fee-title')} </span>

          </div>
          <div className={styles['agent-tips']}>
            {t('vip-fee-affiliate-tips')}
          </div>
          <div className={styles['fee-box']}>
            <div className={styles['fee-item']}>
              <div className={styles['fee-item-title']}>
                {t('fee-item-title-1')}
              </div>
              <div className={styles['fee-item-content']}>
                <div className={styles['fee-detail']}>
                  <div className={styles['fee-item-label']}>
                    {t('fee-item-label-1')}
                  </div>
                  <div className={styles['fee-item-value']}>{futureMakerFee}</div>
                </div>
                <div className={styles['fee-detail']}>
                  <div className={styles['fee-item-label']}>
                    {t('fee-item-label-2')}
                  </div>
                  <div className={styles['fee-item-value']}>{futureTakerFee}</div>
                </div>
              </div>
            </div>
            <div className={styles['fee-line']} />
            <div className={styles['fee-item']}>
              <div className={styles['fee-item-title']}>
                {t('fee-item-title-2')}
              </div>
              <div className={styles['fee-item-content']}>
                <div className={styles['fee-detail']}>
                  <div className={styles['fee-item-label']}>
                    {t('fee-item-label-1')}
                  </div>
                  <div className={styles['fee-item-value']}>{data[vipLevelFromQuery]?.spotFee}</div>
                </div>
                <div className={styles['fee-detail']}>
                  <div className={styles['fee-item-label']}>
                    {t('fee-item-label-2')}
                  </div>
                  <div className={styles['fee-item-value']}>{data[vipLevelFromQuery]?.spotFee}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles['title']}>
            <span>{t('vip-table-title')}</span>
            <div className={styles['title-tips']}>{t('vip-table-tips')}</div>
          </div>
          <div className={styles['list']}>
            {data?.map((item, index) => (
              <div className={styles['list-item']} key={item?.level}>
                {index === vipLevelFromQuery && (
                  <div className={styles['level-tips']}>
                    {t('current-level')}
                  </div>
                )}
                <div className={styles['list-item-title']}>
                  <div
                    className={cls(
                      styles.crown,
                      styles[`crown-${index === 0}`]
                    )}
                  ></div>
                  {item?.level}
                </div>

                <div className={styles['key-value']}>
                  <span className={styles['key']}>{t('trading-volume')}</span>
                  <span className={styles['value']}>{item?.tradingVolume}</span>
                </div>
                <div className={styles['key-value']}>
                  <span className={styles['key']}>{t('vip-futures-fee')}</span>
                  <span className={styles['value']}>{item?.futuresFee}</span>
                </div>
                <div className={styles['key-value']}>
                  <span className={styles['key']}>{t('vip-spot-fee')}</span>
                  <span className={styles['value']}>{item?.spotFee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div >
    );
  }



  return (
    <div className={styles['wrapper']}>
      <div className={cls(styles['header'], 'banner-theme-dark')}>
        <div className={styles['core']}>
          <div className={styles['header-text']}>
            <div className={styles['vip-current-level']}>{t('current-level')}</div>

            <div className={cls(styles['vip-current-title'], {
              [styles.common]: vipLevel === t('originalUser')

            })}>{vipLevel}</div>

          </div>
          <div className={styles['header-img']}></div>
        </div>
      </div>
      <div className={styles['content-fee']}>
        <div className={styles['title']}>
          <span>{t('current-fee-title')} </span>
        </div>
        <div className={styles['agent-tips']}>
          {t('vip-fee-affiliate-tips')}
        </div>
        <div className={styles['fee-box']}>
          <div className={styles['fee-item']}>
            <div className={styles['fee-item-title']}>
              {t('fee-item-title-1')}
            </div>
            <div className={styles['fee-detail']}>
              <div className={styles['fee-item-label']}>
                {t('fee-item-label-1')}
              </div>
              <div className={styles['fee-item-value']}>{futureMakerFee}</div>
            </div>
            <div className={styles['fee-detail']}>
              <div className={styles['fee-item-label']}>
                {t('fee-item-label-2')}
              </div>
              <div className={styles['fee-item-value']}>{futureTakerFee}</div>
            </div>
          </div>
          <div className={styles['fee-line']} />
          <div className={styles['fee-item']}>
            <div className={styles['fee-item-title']}>
              {t('fee-item-title-2')}
            </div>
            <div className={styles['fee-detail']}>
              <div className={styles['fee-item-label']}>
                {t('fee-item-label-1')}
              </div>
              <div className={styles['fee-item-value']}>{data[vipLevelFromQuery]?.spotFee}</div>
            </div>
            <div className={styles['fee-detail']}>
              <div className={styles['fee-item-label']}>
                {t('fee-item-label-2')}
              </div>
              <div className={styles['fee-item-value']}>{data[vipLevelFromQuery]?.spotFee}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['title']}>
        <span>{t('vip-table-title')}</span>
        <div className={styles['title-tips']}>
          <div className={styles.crown}></div>
          <span>{t('vip-table-tips')}</span>
        </div>
      </div>
      <Table
        className={styles['table']}
        pagination={false}
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.level}
      />
    </div>
  );
};
export default Vip;
