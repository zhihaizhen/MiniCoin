import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { toThousands } from '@unified/helpers';
import { getTokensBalance } from '~/api';
import { ReactComponent as GiftBox } from '~/public/images/PC/giftBox.svg';
import { ReactComponent as Arrow } from '~/public/images/PC/rightArrow.svg';
import GiftDetail from './giftDetail'
import styles from './index.module.less';
import { getLang } from '@better-bit-fe/base-utils';
import router from 'next/router';

const MyBenifits = () => {
  const t = useFm();

  const [isShow, setIsShow] = useState(false);
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

  const showGiftDetail = () => {
    setIsShow(true);
  }

  const showBoxDetail = () => {
    const lang = router.locale || getLang();
    location.href = `${location.origin}/${lang}/downloadApp`;
  }


  const handleClose = () => {
    setIsShow(false);
  }

  return (
    <div className={styles.benifitSection}>
      <div className={styles.title}>{t('my_benefit')}</div>
      <div className={styles.items} >
        {/* <div className={styles.itemContainer} onClick={showGiftDetail}>
          <div className={styles.image}>
            <Freeu />
          </div>
          <div className={styles.content}>
            <div className={styles.label} >
              <span>{t('freeUByActivitiesTotal')}</span>
              <Arrow />
            </div>
            <div className={styles.num}>
              <div className={styles.numContainer}>
                <div className={styles.numText}>{toThousands(tokenBalance)}</div>
                <div className={styles.unit}>FreeU</div>
              </div>
              <div className={styles.tag}>{t('canSwapUsdt')}</div>
            </div>
          </div>

        </div> */}
        <div className={styles.itemContainer} onClick={showBoxDetail}>
          <div className={styles.image}>
            <GiftBox />
          </div>
          <div className={styles.content}>
            <div className={styles.label}>
              <span>{t('rewardBlindBox')}</span>
              <Arrow />
            </div>
            <div className={styles.num}>
              <div className={styles.numContainer}>
                <div className={styles.numText}>{boxNum}</div>
                <div className={styles.unit}>{t('box_unit')}</div>
              </div>
            </div>
          </div>
          <div className={styles.tag1}>{t('plsOpenBoxInApp')}</div>
        </div>
      </div>
      <GiftDetail
        isShow={isShow}
        handleClose={handleClose}
        tokenBalance={tokenBalance}
      // refreshList={refreshList}
      />
    </div>
  );
};

export default MyBenifits;