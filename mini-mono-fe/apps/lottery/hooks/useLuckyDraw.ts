import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ACTIVE_STATUS } from '~/enums';
import { getLuckyDraw } from '~/api';
import { RewordProps } from '~/interface';

interface SlotMachineRef {
  play: () => void;
  stop: (index: number[]) => void;
}

interface UseLuckyDrawProps {
  actState: ACTIVE_STATUS;
  luckyCount: number;
  campaignNo?: string;
  luckyEnd?: () => void;
}

export function useLuckyDraw({ actState, luckyCount, campaignNo, luckyEnd }: UseLuckyDrawProps) {
  const t = useFm();
  const [rewards, setRewards] = useState<RewordProps[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const slotRef = useRef<SlotMachineRef>(null);

  const startPlay = useCallback(async (count: number) => {
    if (isPlaying) return;

    if (actState === ACTIVE_STATUS.NOT_START) {
      message.warning(t('lottery-not-start'));
      return;
    }
    if (actState === ACTIVE_STATUS.END) {
      message.warning(t('lottery-end'));
      return;
    }
    if (count > luckyCount) {
      message.warning(t('noLuckyDraw'));
      return;
    }

    // 1. 启动动画
    setIsPlaying(true);
    slotRef.current?.play();

    try {
      // 2. 并行请求：接口请求 + 最小动画时间(2秒)，防止动画一闪而过
      const params = { lottery_count: count, campaign_no: campaignNo };
      const [res] = await Promise.all([
        getLuckyDraw(params),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      if (res) {
        setRewards(res);
        // 接口返回后，根据奖品索引停止动画
        // 假设奖品索引由后端返回或者根据结果计算，这里目前是硬编码或者是根据业务逻辑
        // 在原代码中，stop 的参数是根据奖励计算的
        // slot-machine: stop([res[0].award_index, res[0].award_index, res[0].award_index])
        // slot-machine-block: stop([res[0].award_index, res[0].award_index, res[0].award_index])
        // 注意：有些版本可能没有 award_index
        const awardIndex = res[0]?.award_index ?? 0;
        slotRef.current?.stop([awardIndex, awardIndex, awardIndex]);
      } else {
        slotRef.current?.stop([0, 0, 0]);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Lucky draw error:', error);
      slotRef.current?.stop([0, 0, 0]);
      setIsPlaying(false);
    }
  }, [isPlaying, actState, luckyCount, campaignNo, t]);

  const onAnimationEnd = useCallback(() => {
    setIsPlaying(false);
    setIsOpenModal(true);
    luckyEnd?.();
  }, [luckyEnd]);

  const closeModal = useCallback(() => {
    setIsOpenModal(false);
  }, []);

  return {
    slotRef,
    isPlaying,
    isOpenModal,
    rewards,
    startPlay,
    onAnimationEnd,
    closeModal,
  };
}
