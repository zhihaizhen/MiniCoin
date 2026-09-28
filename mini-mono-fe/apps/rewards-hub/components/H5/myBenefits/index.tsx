import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { toThousands } from '@unified/helpers';
import { getTokensBalance } from '~/api';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { ReactComponent as GiftBox } from '~/public/images/H5/giftBox.svg';
import { ReactComponent as Arrow } from '~/public/images/H5/rightArrow.svg';
import { useRouter } from 'next/router';
import styles from './index.module.less';

const MyBenifits = () => {
  const t = useFm();
  const { locale } = useRouter();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [boxNum, setBoxNum] = useState(0);

  useEffect(() => {
    getTokensBalance({ "award_tokens": "Lottery" }).then(res => {
      res?.forEach(it => {
        if (it.award_token === 'FreeU') {
          setTokenBalance(it.award_amount)
        }
        else {
          setBoxNum(it.award_amount)
        }
      })
    }).catch(() => {})
  }, [])

  //调用app的方法
  const showBoxDetail = () => {
    if (!boxNum || Number(boxNum) === 0) {
      return
    }
    handleGoAppPage('rewardhub/blindbox', 'rewardsHub')   //去登录
  }

  // const showFreeDetail = () => {
  //   // 跳转到freeU的详情页面
  //   window.location.href = `/${locale}/rewards-hub/giftDetail?total=${tokenBalance}`;

  // }

  return (
    <div className={styles.benifitSection}>
      <div className={styles.title}>{t('my_benefit')}</div>
      <div className={styles.items} >
        {/* <div className={styles.itemContainer} onClick={showFreeDetail}>
          <div className={styles.left}>
            <Freeu />
            <div className={styles.content}>
              <div className={styles.label} >{t('gift_coin')}</div>

              <div className={styles.num}>
                <div className={styles.numContainer}>
                  <div className={styles.numText}>{toThousands(tokenBalance)}</div>
                  <div className={styles.unit}>FreeU</div>
                </div>
                <div className={styles.tag}>{t('canSwapUsdt')}</div>
              </div>
            </div>
          </div>
          <Arrow className={styles.arrowIcon} />
        </div> */}
        <div className={styles.itemContainer} onClick={showBoxDetail}>
          <div className={styles.left}>
            <GiftBox />
            <div className={styles.content}>
              <div className={styles.label}>{t('rewardBlindBox')}</div>
              <div className={styles.num}>
                <div className={styles.numContainer}>
                  <div className={styles.numText}>{boxNum}</div>
                  <div className={styles.unit}>{t('box_unit')}</div>
                </div>
              </div>
            </div>
          </div>
          <Arrow className={styles.arrowIcon} />
        </div>
      </div>
    </div>
  );
};

export default MyBenifits;