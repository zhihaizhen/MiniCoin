import React, { useMemo } from 'react';
import { useRegisterAction } from '~/hooks';
import { useFm } from '@better-bit-fe/base-hooks';
import { useCampaign } from '~/context/CampaignContext';
import styles from './index.module.less';

interface RegisterButtonProps {
  onClaimReward?: () => void; // 领取奖励回调
  onTrade?: () => void; // 去交易回调
}

const RegisterButton: React.FC<RegisterButtonProps> = ({
  onClaimReward,
  onTrade
}) => {
  const { handleRegister } = useRegisterAction();
  const t = useFm();
  const { campaignDetail, publicCampaignDetail } = useCampaign();

  // 是否已报名
  const isRegistered = campaignDetail?.is_register === '1';

  // 从接口获取报名时间状态
  const registerTimeStatus = useMemo(() => {
    const detail = campaignDetail || publicCampaignDetail;
    return detail?.register_time_status || '0';
  }, [campaignDetail?.register_time_status, publicCampaignDetail?.register_time_status]);

  // 从接口获取活动时间状态
  const campaignTimeStatus = useMemo(() => {
    const detail = campaignDetail || publicCampaignDetail;
    return detail?.campaign_time_status || '0';
  }, [campaignDetail?.campaign_time_status, publicCampaignDetail?.campaign_time_status]);

  // 获取当前任务状态（从 task_items 中获取当前天的任务）
  const currentTaskStatus = useMemo(() => {
    if (!campaignDetail?.task_items || !campaignDetail?.current_day) {
      return null;
    }
    const currentDay = campaignDetail.current_day === '0' ? '1' : campaignDetail.current_day;
    const currentTask = campaignDetail.task_items.find(item => item.day_no === currentDay);
    return currentTask?.task_status;
  }, [campaignDetail?.task_items, campaignDetail?.current_day]);

  // 根据状态确定按钮文案和是否禁用
  const getButtonConfig = () => {
    // 优先判断：活动已结束
    if (campaignTimeStatus === '2') {
      return {
        text: t('activity-ended'),
        disabled: true,
        className: styles.disabled
      };
    }

    // 如果已报名，根据任务状态显示不同按钮
    if (isRegistered && currentTaskStatus) {
      switch (currentTaskStatus) {
        case 'Awarding':
          // 待领取：显示"去领奖"按钮
          return {
            text: t('today-task-button-claim-reward'),
            disabled: false,
            onClick: onClaimReward,
            className: styles.claimable
          };
        case 'Done':
          // 已完成：显示"已完成"
          return {
            text: t('today-task-button-completed'),
            disabled: true,
            className: styles.completed
          };
        case 'Pending':
          // 发放中
          return {
            text: t('today-task-button-pending'),
            disabled: true,
            className: styles.pending
          };
        case 'Init':
          // 进行中：显示"去交易"按钮
          return {
            text: t('today-task-button-trade'),
            disabled: false,
            onClick: onTrade
          };
        default:
          // 其他状态（Locked等）：显示"已报名"
          return {
            text: t('registered'),
            disabled: true,
            className: styles.disabled
          };
      }
    }

    // 如果已报名但没有任务状态，展示已报名
    if (isRegistered) {
      return {
        text: t('registered'),
        disabled: true,
        className: styles.disabled
      };
    }

    // 未报名时，根据报名时间状态显示
    switch (registerTimeStatus) {
      case '1':
        return {
          text: t('comingSoon'),
          disabled: true,
          className: styles.disabled
        };
      case '2':
        return {
          text: t('closed'),
          disabled: true,
          className: styles.disabled
        };
      case '0':
      default:
        return {
          text: t('register-button'),
          disabled: false,
          onClick: handleRegister
        };
    }
  };

  const { text, disabled, onClick, className } = getButtonConfig();

  return (
    <button
      className={`${styles.registerBtn} ${className || ''} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className={styles.btnGlow}></div>
      <span>{text}</span>
    </button>
  );
};

export default RegisterButton;

