import React, { useMemo, useState } from 'react';
import { message } from 'antd';
import { basePath, div } from '@better-bit-fe/base-utils';
import { Chat } from '@better-bit-fe/base-ui';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useFm } from '@better-bit-fe/base-hooks';
import { useCampaign } from '~/context';
import { useReceiveAward } from '~/hooks/apiHooks';
import { debounce } from '~/utils';
import { EmptyState, LoadingSpinner, ClaimSuccessModal } from '~/components';
import styles from './index.module.less';

type RewardType = 'PreGivenCash' | 'PostGivenCash' | 'ServiceCash' | 'PhysicalAward' | 'RealCash';

type TaskStatus = 'Locked' | 'Init' | 'Awarding' | 'Done' | 'Pending' | 'Expired';

interface GiftCard {
  id: string;
  taskId: string; // task_id 用于领取奖励
  dayNo: string;
  iconType: RewardType;
  amount: string;
  type: string;
  taskStatus?: TaskStatus; // 任务状态
}

const GiftCards = () => {
  const t = useFm();
  const { campaignDetail, publicCampaignDetail, publicLoading, campaignNo, refresh } = useCampaign();
  const { isLogin } = useUserInfo();
  // 领取成功弹窗状态
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // 控制 Chat 组件是否挂载（点击联系客服后才挂载）
  const [shouldMountChat, setShouldMountChat] = useState(false);

  const [claimedAward, setClaimedAward] = useState<{
    name: string;
    amount: string;
    token: string;
    iconType: RewardType;
  }>({
    name: '手续费抵扣金',
    amount: '10',
    token: 'USDT',
    iconType: 'ServiceCash'
  });

  // 当前正在领取的任务 ID
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);

  // 领取奖励 hook
  const { run: receiveAward } = useReceiveAward({
    onSuccess: (data) => {
      // 先显示成功弹窗,不立即刷新数据避免页面闪烁
      setShowSuccessModal(true);
      setClaimingTaskId(null);
    },
    onError: (error) => {
      console.error('领取奖励失败:', error);
      setClaimingTaskId(null);
    }
  });

  // 获取奖励类型文本 key
  const getRewardTypeKey = (rewardType: RewardType): string => {
    const keyMap: Record<RewardType, string> = {
      PreGivenCash: 'reward-type-experience-cash',
      PostGivenCash: 'reward-type-experience-cash',
      ServiceCash: 'reward-type-service-cash',
      PhysicalAward: 'reward-type-physical-award',
      RealCash: 'reward-type-real-cash'
    };
    return keyMap[rewardType] || 'reward-type-default';
  };

  // 从公开接口数据生成礼物卡列表，报名后用私有接口数据更新状态
  const giftCards: GiftCard[] = useMemo(() => {
    if (!publicCampaignDetail?.task_items) {
      return [];
    }

    // 获取公开接口中有奖励的任务（作为基础列表）
    const publicRewardItems = publicCampaignDetail.task_items.filter(
      (item) => item.has_reward === '1'
    );

    // 如果已登录且已报名，获取私有接口中有奖励的任务
    const isRegistered = campaignDetail?.is_register === '1';
    let privateRewardItemsMap = new Map<string, TaskStatus>();

    if (isLogin && isRegistered && campaignDetail?.task_items) {
      // 将私有接口的任务按 day_no 建立映射
      campaignDetail.task_items
        .filter((item) => item.has_reward === '1')
        .forEach((item) => {
          if (item.task_status) {
            privateRewardItemsMap.set(item.day_no, item.task_status as TaskStatus);
          }
        });
    }

    // 根据公开接口列表生成礼物卡，并用私有接口数据更新状态
    return publicRewardItems.map((item) => {
      // 尝试从私有接口数据中获取对应的任务状态
      const taskStatus = privateRewardItemsMap.get(item.day_no);

      // 获取 task_id：只有私有接口才有此字段
      let taskId = '';
      if (isLogin && isRegistered && campaignDetail?.task_items) {
        const privateTask = campaignDetail.task_items.find(
          (t) => t.day_no === item.day_no && t.has_reward === '1'
        );
        taskId = privateTask?.task_id || '';
      }

      return {
        id: item.id,
        taskId, // task_id 字段
        dayNo: item.day_no,
        iconType: item.reward_type as RewardType,
        // 拼接金额和代币，实物奖励特殊处理
        amount:
          item.reward_type === 'PhysicalAward'
            ? t('gift-cards-physical-award-text')
            : `${item.reward_amount} ${item.reward_token}`,
        type: t(getRewardTypeKey(item.reward_type as RewardType)),
        // 如果未登录或未报名，或私有接口中没有匹配的任务，则为待解锁状态
        taskStatus: !isLogin || !isRegistered ? undefined : taskStatus
      };
    });
  }, [publicCampaignDetail, campaignDetail, isLogin, t]);



  // 获取图标路径
  const getIconPath = (iconType: RewardType) => {
    const iconMap: Record<RewardType, string> = {
      PreGivenCash: 'gift-icon-experience.png',
      PostGivenCash: 'gift-icon-experience.png',
      ServiceCash: 'gift-icon-fee.png',
      PhysicalAward: 'gift-icon-physical-award.png',
      RealCash: 'gift-icon-cash.png'
    };
    return `${basePath}/images/${iconMap[iconType]}`;
  };

  // 联系客服回调
  const handleContactService = () => {
    setShouldMountChat(true);

    // 如果已登录，等待 Chat 组件挂载后直接打开客服面板
    if (isLogin) {
      console.log('用户已登录，准备打开客服面板');
      // 延迟执行，确保 Chat 组件和 udesk 已经初始化完成
      setTimeout(() => {
        console.log('延迟执行，检查 window.ud:', !!window.ud);
        // 直接调用 udesk 的 showPanel 方法
        if (window.ud) {
          window.ud('showPanel');
        } else {
          // 如果 udesk 还未初始化，尝试点击客服按钮
          const chatButton = document.querySelector('#brandChat');
          if (chatButton) {
            (chatButton as HTMLElement).click();
          }
        }
      }, 500);
    } else {
      console.log('用户未登录');
    }
  };

  // 领取奖励处理函数
  const handleClaimReward = debounce(async (taskId: string, card: GiftCard) => {
    if (!campaignNo) {
      message.error(t('gift-cards-error-loading'));
      return;
    }

    if (!taskId) {
      message.error(t('gift-cards-error-task-info'));
      return;
    }

    // 设置当前正在领取的任务 ID
    setClaimingTaskId(taskId);

    // 保存当前领取的奖励信息，用于成功弹窗显示
    setClaimedAward({
      name: card.type,
      amount: card.amount.replace(/\s+USDT$/, ''), // 移除可能已有的 USDT 后缀
      token: card.iconType === 'PhysicalAward' ? '' : 'USDT',
      iconType: card.iconType // 保存图标类型
    });

    try {
      await receiveAward({
        campaign_no: campaignNo,
        task_id: parseInt(taskId, 10)
      });
    } catch (error) {
      // 错误已在 onError 中处理
    }
  }, 500);

  // 根据任务状态渲染按钮
  const renderButton = (taskStatus?: TaskStatus, taskId?: string, card?: GiftCard) => {
    // 未登录或未报名：待解锁
    if (!taskStatus) {
      return (
        <button className={`${styles.claimButton} ${styles.locked}`} disabled>
          <div className={styles.buttonIcon}>
            <img src={`${basePath}/images/lock-icon.svg`} alt="lock" />
          </div>
          <div className={styles.buttonText}>{t('gift-cards-button-locked')}</div>
        </button>
      );
    }

    // 根据任务状态显示不同按钮
    switch (taskStatus) {
      case 'Awarding':
        // 领取奖励（绿色按钮）或联系客服（实物奖励）
        const isThisTaskClaiming = claimingTaskId === taskId;
        const isPhysicalAward = card?.iconType === 'PhysicalAward';

        if (isPhysicalAward) {
          // 实物奖励：显示联系客服按钮
          return (
            <button
              className={`${styles.claimButton} ${styles.claimable}`}
              onClick={handleContactService}
            >
              <div className={styles.buttonText}>{t('gift-cards-button-contact-service')}</div>
            </button>
          );
        }

        // 非实物奖励：显示领取按钮
        return (
          <button
            className={`${styles.claimButton} ${styles.claimable}`}
            onClick={() => card && handleClaimReward(taskId || '', card)}
            disabled={isThisTaskClaiming}
          >
            <div className={styles.buttonText}>{isThisTaskClaiming ? t('gift-cards-button-claiming') : t('gift-cards-button-claim')}</div>
          </button>
        );

      case 'Pending':
        // 发放中（灰色禁用状态）
        return (
          <button className={`${styles.claimButton} ${styles.awarding}`} disabled>
            <div className={styles.buttonText}>{t('gift-cards-button-awarding')}</div>
          </button>
        );

      case 'Done':
        // 已领取（灰色禁用状态）
        return (
          <button className={`${styles.claimButton} ${styles.claimed}`} disabled>
            <div className={styles.buttonText}>{t('gift-cards-button-claimed')}</div>
          </button>
        );

      case 'Expired':
        // 已过期（灰色禁用状态）
        return (
          <button className={`${styles.claimButton} ${styles.claimed}`} disabled>
            <div className={styles.buttonText}>{t('gift-cards-button-expired')}</div>
          </button>
        );

      case 'Init':
        // 待解锁
        return (
          <button className={`${styles.claimButton} ${styles.locked}`} disabled>
            <div className={styles.buttonIcon}>
              <img src={`${basePath}/images/lock-icon.svg`} alt="lock" />
            </div>
            <div className={styles.buttonText}>{t('gift-cards-button-locked')}</div>
          </button>
        );

      default:
        // 默认：待解锁
        return (
          <button className={`${styles.claimButton} ${styles.locked}`} disabled>
            <div className={styles.buttonIcon}>
              <img src={`${basePath}/images/lock-icon.svg`} alt="lock" />
            </div>
            <div className={styles.buttonText}>{t('gift-cards-button-locked')}</div>
          </button>
        );
    }
  };

  // 加载中状态（使用 publicLoading，因为 GiftCards 使用的是 publicCampaignDetail 数据）
  if (publicLoading) {
    return <div className={styles.loadingContainer}><LoadingSpinner /></div>;
  }

  // 没有数据
  if (giftCards.length === 0) {
    return <EmptyState />;
  }

  // 卡片数 < 6：PC 单列+ H5 竖向大卡；≥ 6 保持现有双列/横卡
  const isCompact = giftCards.length < 6;

  return (
    <>
      <div className={`${styles.giftCards} ${isCompact ? styles.compact : ''}`}>
        {giftCards.map((card) => (
          <div key={card.id} className={styles.giftCard}>
            <div className={styles.cardLeft}>
              <div className={styles.iconWrapper}>
                <img
                  className={styles.iconImage}
                  src={getIconPath(card.iconType)}
                  alt={card.type}
                />
              </div>
              <div className={styles.giftInfo}>
                {isCompact ? (
                  <>
                    <div className={styles.amount}>
                      {card.iconType === 'PhysicalAward'
                        ? card.amount
                        : `${card.amount} ${card.type}`}
                    </div>
                    <div className={styles.type}>
                      {t('gift-cards-unlock-desc', { days: card.dayNo })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.amount}>{card.amount}</div>
                    <div className={styles.type}>{card.type}</div>
                  </>
                )}
              </div>
            </div>
            {renderButton(card.taskStatus, card.taskId, card)}
          </div>
        ))}
      </div>

      {/* 只有点击过联系客服后才挂载 Chat 组件 */}
      {shouldMountChat && (
        <div className={styles.chatContainer}>
          <Chat chatCls={styles.hiddenChatButton} />
        </div>
      )}

      {/* 领取成功弹窗 */}
      <ClaimSuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // 关闭弹窗后刷新数据,避免领取时页面闪烁
          refresh();
        }}
        awardName={claimedAward.name}
        awardAmount={claimedAward.amount}
        awardToken={claimedAward.token}
        iconType={claimedAward.iconType}
      />
    </>
  );
};

export default GiftCards;

