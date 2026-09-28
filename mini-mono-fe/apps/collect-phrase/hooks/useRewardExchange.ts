import { useFm } from '@better-bit-fe/base-hooks';
import { useEffect, useRef, useState } from 'react';
import { RewardItem } from '~/interface';
import { postExchangeRewards } from '~/api';
import { message } from 'antd';

const useRewardExchange = (
  open: boolean,
  onSuccess: () => void,
  onError: () => void
) => {
  const t = useFm();
  const [award, setAward] = useState<RewardItem>(null);
  const [animationFinished, setAnimationFinished] = useState(false);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasCalledRef.current = false;
    }
    if (!open || hasCalledRef.current) return;

    hasCalledRef.current = true;
    let timer: NodeJS.Timeout;

    postExchangeRewards()
      .then((res) => {
        setAward(res);
        setAnimationFinished(false);
        timer = setTimeout(() => {
          setAnimationFinished(true);
          onSuccess();
        }, 4200);
      })
      .catch((error) => {
        void message.error(t(error?.code || 'unknown-error'));
        onError();
        hasCalledRef.current = false;
      });

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, onSuccess, onError, t]);

  return { award, animationFinished };
};

export default useRewardExchange;
