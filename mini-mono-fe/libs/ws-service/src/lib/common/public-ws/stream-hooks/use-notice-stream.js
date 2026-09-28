import { useEffect } from 'react';
// import {
//   PUBLIC_NOTICE_FUTURE_Q_WILL_DELIVERY,
//   PUBLIC_NOTICE_FUTURE_BIQ_WILL_DELIVERY,
//   PUBLIC_NOTICE_FUTURE_NBIQ_WILL_DELIVERY
// } from '../../../constants/lskey';
// import { useTranslation } from 'react-i18next';
// import { message } from '../../packages/by-components';
import { noticeStream } from '../streams/notice.stream';

const useNoticeStream = () => {
  // const [t] = useTranslation();

  useEffect(() => {
    const subscription = noticeStream.subscribe((result) => {
      if (!result?.data) return;

      const futureLocationReg = /(N?BI)?Q(?=$|\?)/;
      const { pathname } = window && window.location;
      // 当前非交割合约
      if (!futureLocationReg.test(pathname)) return;

      const {
        // coin,
        // symbol,
        symbolName, // 合约名称 如BTCUSD0625
        // year, // 年份
        // contractStatus, // 状态
        quarterType // 交割倒计时，单位秒
        // expectSettlePriceE4, // 预期结算价格
      } = result.data;
      const timeLeft = Number(quarterType);

      // 交割倒计时大于30分钟
      if (!timeLeft || timeLeft > 1800) return;

      // const QKey = `${PUBLIC_NOTICE_FUTURE_Q_WILL_DELIVERY}_${symbolName}`;
      // const BIQKey = `${PUBLIC_NOTICE_FUTURE_BIQ_WILL_DELIVERY}_${symbolName}`;
      // const NBIQKey = `${PUBLIC_NOTICE_FUTURE_NBIQ_WILL_DELIVERY}_${symbolName}`;
      const QKey = `_${symbolName}`;
      const BIQKey = `_${symbolName}`;
      const NBIQKey = `_${symbolName}`;
      const flag =
        window && window.location.pathname.match(futureLocationReg)[0];
      const alreadyHinted = {
        Q: !!localStorage.getItem(QKey),
        BIQ: !!localStorage.getItem(BIQKey),
        NBIQ: !!localStorage.getItem(NBIQKey)
      }[flag];

      // 已提示过
      if (alreadyHinted) return;

      const lskey = {
        Q: QKey,
        BIQ: BIQKey,
        NBIQ: NBIQKey
      }[flag];
      const hintTranslateKey = {
        Q: 'futureWillDeliveryQ',
        BIQ: 'futureWillDeliveryBIQ',
        NBIQ: 'futureWillDeliveryNBIQ'
      }[flag];

      // message.info(t(hintTranslateKey, { symbolName }));
      localStorage.setItem(lskey, true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
};

export default useNoticeStream;
