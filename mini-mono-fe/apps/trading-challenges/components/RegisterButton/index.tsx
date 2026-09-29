import React from 'react';
import { useRegisterAction } from '~/hooks';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCampaign } from '~/context/CampaignContext';
import { debounce, jumpToPage } from '~/utils';
import styles from './index.module.less';

interface RegisterButtonProps {
  registerTimeStatus?: '0' | '1' | '2'; // 0:正常进行，1:未开始报名，2:已结束报名
}

const RegisterButton: React.FC<RegisterButtonProps> = ({ registerTimeStatus = '0' }) => {
  const { handleRegister } = useRegisterAction();
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { campaignDetail, privateCampaignDetail } = useCampaign();

  // 登录态未判定时先 loading；登录后私有详情未返回也继续 loading，避免中间态闪烁
  const isWaitingPrivateDetail = isLogin !== false && !privateCampaignDetail;
  const isRegistered =
    (isLogin ? privateCampaignDetail?.is_register : campaignDetail?.is_register) === '1';
  const campaignTimeStatus = campaignDetail?.campaign_time_status ?? '1';

  const handleTrade = debounce(() => {
    jumpToPage('trade');
  }, 500);

  const getButtonConfig = () => {
    if (campaignTimeStatus === '1') {
      return { text: t('comingSoon'), disabled: true, onClick: undefined };
    }

    if (campaignTimeStatus === '2') {
      return { text: t('closed'), disabled: true, onClick: undefined };
    }

    if (isRegistered) {
      return { text: t('daily-challenge-button-trade-now'), disabled: false, onClick: handleTrade };
    }

    return { text: t('register-button'), disabled: false, onClick: handleRegister };
  };

  if (isWaitingPrivateDetail) {
    return (
      <button className={`${styles.registerBtn} ${styles.skeleton}`} disabled>
        <span style={{ opacity: 0 }}>{t('daily-challenge-button-trade-now')}</span>
      </button>
    );
  }

  const { text, disabled, onClick } = getButtonConfig();

  return (
    <button
      className={`${styles.registerBtn} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className={styles.btnGlow}></div>
      <span>{text}</span>
    </button>
  );
};

export default RegisterButton;
