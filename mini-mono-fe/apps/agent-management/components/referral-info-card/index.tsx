//  @ts-nocheck
import {
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react';
import { message } from 'antd';
import { useRouter } from 'next/router';
import { isApp, isPC } from '@better-bit-fe/base-utils';
import { getLang } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useContextReferral } from '~/context/transactionHistoryContext';
import { ellipsisFormatter } from '~/utils/ellipsisText';
import { formatNumberClean } from '~/utils/format-number';
import { keepUrlQueryParams } from '~/utils/url';
import styles from './index.module.less';
import copy from 'copy-to-clipboard';
import { jumpToUrl } from '~/utils/url';

let ReferralInfoCard = (props, ref) => {
  const t = useFm();
  const {
    hasAuth,
    defaultReferralLink,
    fetchDefaultReferralLink,
    userProfile
  } = useContextReferral();

  useImperativeHandle(ref, () => ({
    handleRefresh: () => {
      fetchDefaultReferralLink();
    }
  }));

  useEffect(() => {
    if (hasAuth) {
      fetchDefaultReferralLink();
    }
  }, [userProfile, hasAuth]);

  const defaultRebateRate = useMemo(
    () =>
      formatNumberClean(defaultReferralLink?.totalRebateRate, {
        nullIndicator: '-',
        suffix: '%',
        prefix: ''
      }),
    [defaultReferralLink]
  );

  const defaultLink = useMemo(() => {
    return defaultReferralLink?.inviteLink || '';
  }, [defaultReferralLink]);

  const handleRedirectReferralSettings = () => {
    jumpToUrl(keepUrlQueryParams('/newInvitefriends'));
  };

  const handleInvite = () => {
    const lang = getLang() || 'en-US';
    if (!isPC()) {
      const param = {
        methodName: 'push',
        moduleName: '_b_bridge_Router_',
        uniqueId: 'handleInvite', // 用于回调
        params: {
          path: 'https://www.easicoin.io/share_page',
          inviteLink: defaultLink,
          inviteCodeText: `${t('inviteCode')}:${defaultReferralLink?.inviteCode
            }`,
          bannerImgUrl: `${location.origin}/static/image/invitefriends/poster-${lang}.png`,
          text: `${t('inviteText')}`
        }
      };
      try {
        const jsonPrams = JSON.stringify(param);
        window.flutter_inappwebview.callHandler('_b_bridge_Router_', jsonPrams);
      } catch (err) {
        throw new Error(err);
      }
    }
  };

  const handleCopy = async (val) => {
    copy(val);
    message.success(t('copied'));
  };

  return (
    <div className={styles.referralInfoCard}>
      <div className={styles.referralInfoCard_container}>
        <div className={styles.referralInfoCard_sm_info}>
          <div className={styles.referralInfoCard_sm_info_item}>
            <div className={styles.referralInfoCard_sm_info_item_label}>
              {t('myCommissionRate')}
            </div>
            <div className={styles.referralInfoCard_sm_info_item_value}>
              {defaultRebateRate}
            </div>
          </div>
          <div className={styles.referralInfoCard_sm_info_item}>
            <div
              className={styles.referralInfoCard_sm_info_item_links}
              onClick={handleRedirectReferralSettings}
            >
              {t('referralSettings')}
            </div>
          </div>
        </div>
        <div className={styles.referralInfoCard_content}>
          <div className={styles.referralInfoCard_lg_info}>
            <div className={styles.referralInfoCard_lg_info_label}>
              {t('referalCode')}
            </div>
            <div className={styles.referralInfoCard_lg_info_value}>
              <div className={styles.referralInfoCard_lg_info_value_data}>
                {defaultReferralLink?.inviteCode}
              </div>
              <div
                className={styles.referralInfoCard_lg_info_value_icon}
                onClick={() => handleCopy(defaultReferralLink?.inviteCode)}
              />
            </div>
          </div>
          <div className={styles.referralInfoCard_lg_info}>
            <div className={styles.referralInfoCard_lg_info_label}>
              {t('referalLink')}
            </div>
            <div className={styles.referralInfoCard_lg_info_value}>
              <div className={styles.referralInfoCard_lg_info_value_data}>
                {ellipsisFormatter(defaultLink)}
              </div>
              <div
                className={styles.referralInfoCard_lg_info_value_icon}
                onClick={() => handleCopy(defaultLink)}
              />
            </div>
          </div>
          <div className={styles.referralInfoCard_btn} onClick={handleInvite}>
            {t('shareImage')}
          </div>
        </div>
      </div>
    </div>
  );
};

ReferralInfoCard = forwardRef(ReferralInfoCard);

export default ReferralInfoCard;
