import {
  ByButton,
  ByDialog,
  ByInputNumber,
  ByModal,
  BySelect,
  BySelectOption,
  BySwitch
} from '@region/react-ui';
import { message } from 'antd';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';
import {
  doExchange,
  getAssetsExchangeSetting,
  getExchangeAskPrice,
  getWalletBalance
} from './src/api';
import {
  COINS,
  COIN_QTY_PRECISION,
  EXCHANGE_STATUS,
  QTY_PERCENTAGE_SELECTIONS
} from './src/constants';

const ByCoinExchange = ({ http, show, showCallBack }) => {
  const [t] = useTranslation();
  const [open, setOpen] = useState(show);

  // 计算当前的 可用余额 = 可用余额 - 可用余额 * setting_fee百分比
  // type 为1 可用余额 = 可用余额 - 手续费setting_fee
  // type 为2 , 可用余额 = 可用余额 - 可用余额 * setting_fee百分比
  const [type, setType] = useState(1);
  const [settingFee, setSettingFee] = useState();

  const [coinLeft, setCoinLeft] = useState('BTC');
  const [coinRight, setCoinRight] = useState('');

  // 报价按钮
  const [buttonActive, setButtonActive] = useState(false);
  const [buttonLoadding, setButtonLoadding] = useState(false);
  // 兑换按钮
  const [buttonActive2, setButtonActive2] = useState(false);
  const [button2Loadding, setButton2Loadding] = useState(false);

  const [amount, setAmount] = useState();
  const [limitPlaceholder, setLimitPlaceholder] = useState('');
  const [precision, setPrecision] = useState(8);
  // 钱包币对信息，格式为 {BTC: {xxx: xxx}, ...}
  const [walletBalance, setWalletBalance] = useState();
  const [amountPercentage, setAmountPercentage] = useState();
  const [singleLimit, setSingleLimit] = useState('--');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [exchangeRateLine1, setExchangeRateLine1] = useState('--');
  const [exchangeRateLine2, setExchangeRateLine2] = useState('--');
  const [h24Limit, seth24Limit] = useState('--/--');
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const [maxInputAmount, setMaxInputAmount] = useState(Number.MAX_VALUE);

  const [showCoinExDialog, setShowCoinExDialog] = useState(false);

  const resetStates = () => {
    setButtonActive(false);
    setButtonActive2(false);
    setSingleLimit('--');
    seth24Limit('--/--');
    setAmountPercentage(0);
    setLimitPlaceholder('');
    setMinAmount(0);
    setMaxAmount(0);
    setExchangeRateLine1('--');
    setExchangeRateLine2('--');
    setButtonLoadding(false);
    setButton2Loadding(false);
    setSettingFee();
  };
  const updateAssetsSetting = () => {
    getAssetsExchangeSetting(http, coinLeft, coinRight).then((res) => {
      setSingleLimit(
        `${res.exchange_scope_min}-${res.exchange_scope_max} ${coinLeft}`
      );
      seth24Limit(`${res.single_remainder} / ${res.single_limit} ${coinLeft}`);
      setMinAmount(res.exchange_scope_min);
      setMaxAmount(res.exchange_scope_max);
      setType(res.fee_type);
      setSettingFee(res.setting_fee);
    });
  };

  const handlePrecisionHelper = (v) => {
    // const cal = value * 10 ** COIN_QTY_PRECISION[coinLeft.toLowerCase()];
    // const calInt = parseInt(cal, 10);
    // return calInt / (10 ** COIN_QTY_PRECISION[coinLeft.toLowerCase()]);
    const p = COIN_QTY_PRECISION[coinLeft.toLowerCase()];
    return v ? parseFloat(v).toFixed(p) : '';
  };

  // 计算当前的 可用余额 = 可用余额 - 可用余额 * setting_fee百分比
  // type 为1 可用余额 = 可用余额 - 手续费setting_fee
  // type 为2 , 可用余额 = 可用余额 - 可用余额 * setting_fee百分比
  // calcCommissionFee(fee, percent) {
  //   const power = 10 ** this.fromCoinPrecision;
  //   let amount = (
  //     this.availableBalance * power
  //       - fee * power
  //   ) * percent / power;
  //   amount = amount > 0 ? amount : 0;
  //   return amount;
  // },

  // const calcCommissionFee = (fee, percent) => {
  //   // const power = 10 ** COIN_QTY_PRECISION[coinLeft];
  //   let amount = (walletBalance[coinLeft].available_balance - fee) * percent;
  //   amount = amount > 0 ? amount : 0;
  //   return amount;
  // };

  const handleSwitchClick = () => {
    const c1 = coinLeft;
    setCoinLeft(coinRight);
    setCoinRight(c1);
  };

  const handleLeftCoinClick = (c) => {
    if (c === coinRight) {
      handleSwitchClick();
    } else {
      setCoinLeft(c);
    }
  };

  const handleRightCoinClick = (c) => {
    if (c === coinLeft) {
      handleSwitchClick();
    } else {
      setCoinRight(c);
    }
  };

  const handlePercentageClick = (v, i, n, c) => {
    if (!coinLeft) return;
    const p = c[coinLeft.toLowerCase()];
    setPrecision(p);
    if (
      walletBalance &&
      walletBalance[coinLeft] &&
      walletBalance[coinLeft].available_balance
    ) {
      setAmount(handlePrecisionHelper(limitPlaceholder * v));
    }
    setAmountPercentage(v);
  };

  const handleAmountChange = (v) => {
    if (v !== undefined && v !== parseFloat(amount)) setAmountPercentage(0);
    if (v !== undefined) setAmount(v);
  };

  const handleCloseButtonClick = () => {
    resetStates();
    setOpen(!open);
    setCoinRight(undefined);
  };

  const hanleQuotationClick = () => {
    if (!buttonActive) return;
    setButtonLoadding(true);
    const quoteParams = {
      amount,
      from_coin: coinLeft,
      to_coin: coinRight
    };
    getExchangeAskPrice(http, quoteParams)
      .then((res) => {
        const rate = res.exchange_rate;
        const qty = res.to_amount;
        setExchangeRate(rate);
        setExchangeRateLine1(`1 ${coinLeft} = ${rate} ${coinRight}`);
        setExchangeRateLine2(
          `${t('exchangePay')} ${amount} ${coinLeft}, ${t(
            'get'
          )} ${qty} ${coinRight}`
        );
        setButtonLoadding(false);
      })
      .finally(() => {
        setButtonLoadding(false);
      });
  };

  const handleWalletBalanceAmount = (arr) => {
    const temp = {};
    const { list } = arr;
    for (let i = 0; i < list.length; i += 1) {
      const { coin } = list[i].data;
      temp[coin] = list[i].data;
      temp[coin].available_balance = temp[coin]?.availableBalanceE8 / 10 ** 8;
    }
    return temp;
  };

  // const handlePosition = (list, v) => {
  //   let rv = v;
  //   if (list?.positionList?.list?.length) {
  //     for (let i = 0; i < list.positionList.list.length; i += 1) {
  //       const tl = list.positionList.list[i];
  //       if (!tl.isIsolated && tl.unrealisedPnlE8 < 0) {
  //         rv = v + tl.unrealisedPnlE8 / 10 ** 8;
  //       }
  //     }
  //   }
  //   return rv;
  // };

  //  do exchange
  const handleExchange = () => {
    setShowCoinExDialog(false);
    if (!buttonActive2) return;
    setButton2Loadding(true);
    const exchangeParams = {
      amount,
      from_coin: coinLeft,
      to_coin: coinRight,
      to_exchange_rate: exchangeRate
    };
    doExchange(http, exchangeParams)
      .then(({ status }) => {
        resetStates();
        setAmount();
        getWalletBalance(http).then((res) => {
          setWalletBalance(handleWalletBalanceAmount(res));
          setButton2Loadding(false);
        });
        updateAssetsSetting();

        let msg = t('exchangeSuccess');
        let type = 'success';
        if (status === EXCHANGE_STATUS.FAILURE) {
          type = 'error';
          msg = t('exchangeFailure');
        }
        message[type](msg);
      })
      .catch((e) => {
        // code  = 4xx ，5xx 表示 Invalid
        const code = e.data?.code;
        if (code >= 400 && code <= 599) {
          message.warn(t('invalidExchange'));
          return;
        }
        Promise.reject(e);
      })
      .finally(() => {
        setButton2Loadding(false);
      });
  };

  useEffect(() => {
    setAmount();
  }, [coinLeft, coinRight]);
  useEffect(() => {
    // setAmountPercentage(0);
    if (!coinLeft) setAmount();
    else if (
      walletBalance &&
      walletBalance[coinLeft] &&
      parseFloat(limitPlaceholder) < parseFloat(amount)
    ) {
      setAmount(limitPlaceholder);
    }
  }, [coinLeft, amount, limitPlaceholder]);

  // update input placeholder (最大可以兑换的币的数量)
  useEffect(() => {
    if (coinLeft && walletBalance && !settingFee) {
      const givenCash = walletBalance[coinLeft].givenCashE8 / 10 ** 8;
      let tempV = walletBalance[coinLeft].available_balance - givenCash;
      tempV = tempV > 0 ? tempV : 0;
      setLimitPlaceholder(handlePrecisionHelper(tempV));
    } else if (coinLeft && walletBalance && settingFee) {
      let tempV = walletBalance[coinLeft].available_balance;

      // wallet Balance 需要减去1.手续费, 2.赠金

      // 1. 手续费
      // type 为1 可用余额 = 可用余额 - 手续费setting_fee
      // type 为2 , 可用余额 = 可用余额 - 可用余额 * setting_fee百分比
      if (type === 1) {
        tempV -= settingFee;
      } else {
        tempV *= 1 - settingFee;
      }

      // 2. 赠金
      const givenCash = walletBalance[coinLeft].givenCashE8 / 10 ** 8;
      tempV -= givenCash;

      // 3. 全仓情况处理
      // tempV = handlePosition(positionList, tempV);
      tempV = handlePrecisionHelper(tempV);
      if (tempV < 0) tempV = 0;
      setLimitPlaceholder(tempV.toString());
    } else {
      setLimitPlaceholder('');
    }
  }, [coinLeft, coinRight, walletBalance, settingFee, type]);

  // update wallet balance
  useEffect(() => {
    if (open) {
      getWalletBalance(http).then((res) => {
        setWalletBalance(handleWalletBalanceAmount(res));
      });
    }
  }, [open]);

  // quotation button 状态控制
  useEffect(() => {
    if (
      walletBalance &&
      walletBalance[coinLeft] &&
      walletBalance[coinLeft].available_balance < minAmount
    ) {
      setButtonActive(false);
    } else if (minAmount && amount && amount >= minAmount) {
      setButtonActive(true);
    } else {
      setButtonActive(false);
    }
  }, [amount, minAmount, maxAmount]);

  // 任何一侧 coin flip, 重新调用setting接口
  useEffect(() => {
    resetStates();
    if (coinLeft && coinRight) {
      // getAssetsExchangeSetting(http, coinLeft, coinRight).then((res) => {
      //   setSingleLimit(`${res.exchange_scope_min}-${res.exchange_scope_max} ${coinLeft}`);
      //   seth24Limit(`${res.single_remainder} / ${res.single_limit} ${coinLeft}`);
      //   setMinAmount(res.exchange_scope_min);
      //   setMaxAmount(res.exchange_scope_max);
      //   if (amount && amount > res.exchange_scope_min) {
      //     setButtonActive(true);
      //   }
      // });
      updateAssetsSetting();
    }
  }, [coinLeft, coinRight]);

  // 输入的兑换币的数量变化
  useEffect(() => {
    setExchangeRateLine1('--');
    setExchangeRateLine2('--');
    setExchangeRate(0);
  }, [amount]);

  // input 输入最大值控制
  useEffect(() => {
    if (walletBalance && maxAmount) {
      const m = Math.min(walletBalance[coinLeft].available_balance, maxAmount);
      setMaxInputAmount(m);
    }
  }, [maxAmount, walletBalance]);

  // 报价button 状态控制
  useEffect(() => {
    if (!amount) setButtonActive(false);
  }, [amount]);

  // 兑换button 状态控制
  useEffect(() => {
    if (exchangeRateLine1 !== '--' && exchangeRateLine2 !== '--') {
      setButtonActive2(true);
    } else {
      setButtonActive2(false);
    }
  }, [exchangeRateLine1, exchangeRateLine2, exchangeRate]);

  // 兑换框展示和隐藏
  useEffect(() => {
    setOpen(show);
  }, [show]);

  useEffect(() => {
    showCallBack(open);
  }, [open]);

  const closeExDialog = () => {
    setShowCoinExDialog(false);
  };

  return (
    <>
      <ByModal
        draggable
        open={open}
        hideMask
        dragProps={{ handle: '.re-coin-exchange__header' }}
      >
        <div className="re-coin-exchange__wrapper gc-06">
          <div className="re-coin-exchange__header flex">
            <span className="re-coin-exchange__header-text">
              {t('coinExchange')}
            </span>
            <span
              className="icon iconfont icon-close"
              onClick={handleCloseButtonClick}
            />
          </div>
          <div className="re-coin-exchange__coin">
            <div className="by-coin-exchange__coin-type flex v-center">
              <span className="re-coin-exchange__coin-type-text ">
                {t('coins')}
              </span>
              <span className="re-coin-exchange__coin-type-select">
                <BySelect
                  value={coinLeft}
                  onChange={handleLeftCoinClick}
                  type="outlined"
                  size="large"
                >
                  <For
                    each="coin"
                    of={COINS.filter((coin) => coin !== coinRight)}
                  >
                    <BySelectOption value={coin} key={coin}>
                      {coin}
                    </BySelectOption>
                  </For>
                </BySelect>
              </span>
              <span
                className="re-coin-exchange—coin-switch icon iconfont icon-change"
                onClick={handleSwitchClick}
              />
              <span className="re-coin-exchange__coin-type-select">
                <BySelect
                  value={coinRight}
                  onChange={handleRightCoinClick}
                  type="outlined"
                  size="large"
                >
                  <For
                    each="coin"
                    of={COINS.filter((coin) => coin !== coinLeft)}
                  >
                    <BySelectOption value={coin} key={coin}>
                      {coin}
                    </BySelectOption>
                  </For>
                </BySelect>
              </span>
            </div>
            <div className="re-coin-exchange__coin-amount">
              <span className="re-coin-exchange__coin-type-text">
                {t('exchangeAmount')}
              </span>
              <ByInputNumber
                value={amount ? parseFloat(amount) : ''}
                leftIcon=" "
                onChange={(v) => handleAmountChange(v)}
                precision={precision}
                type="outlined"
                size="large"
                placeholder={
                  limitPlaceholder
                    ? handlePrecisionHelper(limitPlaceholder)
                    : ''
                }
                max={maxInputAmount}
              />
              <ByButton
                onClick={hanleQuotationClick}
                color="brand"
                type="contained"
                loading={buttonLoadding}
                className={
                  buttonActive
                    ? 'by-coin-exchange__button-active'
                    : 're-coin-exchange__button-unative'
                }
              >
                {t('getQuotation')}
              </ByButton>
            </div>

            <div className="re-coin-exchange__coin-percentage">
              <BySwitch
                className="flex full"
                size="small"
                color="gc-4"
                value={amountPercentage}
                values={QTY_PERCENTAGE_SELECTIONS}
                onChange={(v, n, i) =>
                  handlePercentageClick(v, n, i, COIN_QTY_PRECISION)
                }
              />
            </div>
          </div>
          <div className="re-coin-exchange__price">
            <div className="re-coin-exchange__price-header">
              {t('quotation')}
            </div>
            <div className="re-coin-exchange__price-coin_1">
              {exchangeRateLine1}
            </div>
            <div className="re-coin-exchange__price-coin_2 gc-08">
              {exchangeRateLine2}
            </div>
            <div className="re-coin-exchange__price-available-limit">
              <span className="by-coin-exchange__price-available">
                {t('singleLimit')}: {singleLimit}
              </span>
              <span className="by-coin-exchange__price-limit">
                {t('24hLimit')}: {h24Limit}
              </span>
            </div>
          </div>

          <div className="re-coin-exchange__footer re-dialog__foot flex">
            <ByButton
              onClick={() => {
                if (buttonActive2) setShowCoinExDialog(true);
              }}
              size="large"
              className={`${
                buttonActive2
                  ? 'by-coin-exchange__button-active'
                  : 're-coin-exchange__button-unative'
              } re-dialog__btn re-button--contained`}
              color="brand"
              loading={button2Loadding}
            >
              {t('Exchange')}
            </ByButton>
            <ByButton
              size="large"
              type="outlined"
              className="re-dialog__btn"
              color="secondary"
              onClick={handleCloseButtonClick}
            >
              {t('cancel')}
            </ByButton>
          </div>
        </div>
      </ByModal>
      <ByDialog
        innerClass="re-coin-exchange__inner-dialog"
        className="re-coin-exchange__mask"
        head={t('confirmExchange')}
        showConfirm
        open={showCoinExDialog}
        confirmText={t('confirm')}
        onClose={closeExDialog}
        onCancel={closeExDialog}
        onConfirm={handleExchange}
        showCancel
        cancelText={t('cancel')}
      >
        <p className="re-coin-exchange__text">{t('exchangeText1')}</p>
        <p className="re-coin-exchange__text">{t('exchangeText2')}</p>
        <br />
        <p className="re-coin-exchange__red">{t('exchangeText3')}</p>
        <p className="re-coin-exchange__red">{t('exchangeText4')}</p>
      </ByDialog>
    </>
  );
};

ByCoinExchange.defaultProps = {
  http: null,
  show: false,
  showCallBack: null
  // positionList: null,
};

ByCoinExchange.propTypes = {
  http: PropTypes.func,
  show: PropTypes.bool,
  showCallBack: PropTypes.func
  // positionList: PropTypes.object,
};

export default ByCoinExchange;
