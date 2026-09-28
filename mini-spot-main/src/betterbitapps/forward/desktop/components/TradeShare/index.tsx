// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import BigNumber from 'bignumber.js';
import cls from 'classnames';
import { useTranslation } from 'react-i18next';
import Modal from './modal';
import { useConfigBySymbol } from '@/store-hooks/use-symbol-config';
import { useGlobalState } from '@/store';
import { ReactComponent as ShareIcon } from '@/assets/trade-share/share.svg';
import { getRandomId } from './helper';
import './index.less';

// type取值为position（表示仓位）||pnl（持仓盈亏）,price 可表示lastprice或markprice
const TradeShare = ({ data, price, upnlBaceCalc, type = 'pnl' }: any) => {
  const [t] = useTranslation('trade-share');
  const [showShareModal, setShowShareModal] = useState(false);

  const [globalState] = useGlobalState();
  const { user } = globalState;

  const { avatar, nick_name } = user?.info || {};
  const invitesInfo = user?.invitesInfo;
  const symbol = data?.symbol || data?.symbolAlias;
  const curSymbolConfig = useConfigBySymbol(symbol); // symbol不能用symbolAlias
  const {
    balanceFraction = 4,
    priceFraction = 2,
    walletCoin,
  } = curSymbolConfig;
  const newData = useMemo(() => {
    return {
      ...data,
      walletCoin,
      balanceFraction,
      priceFraction,
      showPrice: price,
      upnlBaceCalc,
    };
  }, [data, upnlBaceCalc]);
  const modalEleId = useMemo(() => getRandomId(), []);

  const handleShare = (event) => {
    event.stopPropagation();
  };

  const handleClose = () => {
    setShowShareModal(false);
  };

  useEffect(() => {
    if (showShareModal) {
      const modalEle = document.createElement('div');
      modalEle.setAttribute('id', modalEleId);
      document.body.appendChild(modalEle);

      ReactDOM.render(
        <Modal
          username={nick_name}
          avatar={avatar}
          invitesInfo={invitesInfo}
          data={newData}
          t={t}
          onClose={handleClose}
          type={type}
        />,
        document.getElementById(modalEleId),
      );
    } else {
      const modalEle = document.getElementById(modalEleId);

      if (modalEle) {
        modalEle?.remove();
      }
    }
  }, [showShareModal]);

  useEffect(() => {
    const handleClick = () => {
      window.removeEventListener('click', handleClick);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="trade-share">
      <ShareIcon className="trade-share-icon" onClick={handleShare} />
    </div>
  );
};

export default TradeShare;
