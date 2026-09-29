import { localDateTime, toThousands, transformNum } from '@unified/helpers';
import PositionTab from 'common/components/Positions/positions-tab/index';
import { message } from 'common/antdComponents';
import copy from 'copy-to-clipboard';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toThousandsNumberNoZero } from 'common/utils/utils';
import { useGlobalState, types } from '@/store';
import SymbolFilter, {
  symbolFilterRef,
  handleSymbolCloseDropDown,
  handleResetFilter,
} from '../SymbolFilter';
import Styles from '../index.module.less';

const TradeDetail = (props) => {
  const { tab } = props;
  const [globalState, globalDispatch] = useGlobalState();
  const [t] = useTranslation();
  const { list } = globalState.position.dealList;
  const filterValue = useMemo(() => {
    return symbolFilterRef.current?.filterValue?.value;
  }, [symbolFilterRef.current?.filterValue?.value]);
  const data = useMemo(() => {
    let res = list;
    if (filterValue) {
      res = list.filter((it) => it.baseTokenName === filterValue);
    }
    return res;
  }, [filterValue, list]);
  const handleCopyOrderId = async (id) => {
    copy(id);
    message.success(t('copied'));
  };

  // 交易记录=交易历史=成交明细
  const trs = [
    {
      name: t('Symbol'),
      key: 'symbolName',
      style: {
        whiteSpace: 'nowrap',
      },
      class: 'fixfirstColumn',
      render: (trData) => (
        <span>
          {trData.baseTokenName}/{trData.quoteTokenName}
        </span>
      ),
    },
    {
      name: t('time'),
      key: 'time',
      style: {
        width: '12%',
      },
      render: (trData) => <span>{localDateTime(trData.time)}</span>,
    },
    // 方向
    {
      name: t('tradeSide'),
      key: 'side',
      style: {
        width: '8%',
      },
      render: (trData) => (
        <span className={Styles[trData.side]}>{t(trData.side)}</span>
      ),
    },
    // 成交均价
    {
      name: t('filledPrice'),
      key: 'price',
      render: (trData) => {
        return <span>{toThousandsNumberNoZero(trData.price)}</span>;
      },
    },
    // 成交数量
    {
      name: t('filled-qty'),
      key: 'quantity',
      render: (trData) => {
        return (
          <span>
            {toThousandsNumberNoZero(trData.quantity)} {trData.baseTokenName}
          </span>
        );
      },
    },
    // 成交额
    {
      name: t('filled-amount'),
      key: 'amount',
      render: ({ amount, quoteTokenName }) => {
        return (
          <span>
            {amount} {quoteTokenName}
          </span>
        );
      },
    },

    // 委托类型
    {
      name: t('orderType'),
      key: 'type',
      render: ({ type }) => <span>{t(`${type.toLowerCase()}Order`)}</span>,
    },
    // 流动性方向
    {
      name: t('fluidity-direction'),
      key: 'role',
      render: ({ role }) => <span>{t(role)}</span>,
    },

    // 手续费 8位，向上取整
    {
      name: t('tradeFee'),
      key: 'fee',
      render: ({ fee, feeTokenName }) => {
        return (
          <span>
            {fee} {feeTokenName}
          </span>
        );
      },
    },

    // 订单编号
    {
      name: t('orderId'),
      key: 'orderId',
      render: (trData) => (
        <span
          className={Styles.orderId}
          onClick={(event) => {
            event.stopPropagation();
            handleCopyOrderId(trData.orderId);
          }}
        >
          {String(trData.orderId).substr(-8)}
          <span className={Styles.copyImg} />
        </span>
      ),
    },
  ];

  const symbolProps = {
    ...props,
  };

  return (
    <div className={`${Styles.dataWrapper} ${Styles.tradeDetailWrapper}`}>
      <div className={Styles.flex}>
        <SymbolFilter ref={symbolFilterRef} {...symbolProps} />
      </div>

      <PositionTab
        tab={{ trs, ...tab }}
        data={data}
        innerClass={Styles['trade-detail']}
      />
    </div>
  );
};

TradeDetail.propTypes = {
  tab: PropTypes.object.isRequired,
};

export default TradeDetail;
