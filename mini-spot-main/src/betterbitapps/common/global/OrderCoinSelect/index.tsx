import { Select, Option } from 'common/antdComponents';
import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { types, useGlobalState } from '@/store';
import Style from './index.module.less'

export const OrderCoinSelect = (
  {
    handleChange,
  }: any
) => {
  const [t] = useTranslation();
  const [globalState, globalDispatch] = useGlobalState();
  const { symbolFullName, spotCoin, walletCoin } = globalState;

  const createOrderCoinObj = useMemo(() => {
    const key = 'SPOT_ORDER_COIN_TYPE';
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : {};
  }, [symbolFullName])  // 现货需要用fullname来存储

  const curCoinValue = useMemo(() => {
    return createOrderCoinObj[symbolFullName] || spotCoin;
  }, [symbolFullName]) // 获取当前币种下单区存储的下单单位，默认是数量下单

  const [orderCoinType, setOrderCoinType] = useState(curCoinValue) 

  const optionList = useMemo(() => {
    const list = [{
      labelKey: 'openType-qty',
      value: spotCoin,
    }, {
      labelKey: 'openType-usdt',
      value: walletCoin
    }]
    return list
  }, [spotCoin, walletCoin, symbolFullName])
  // 币种切换的时候和页面初始化时都需要调用

  useEffect(() => {
    if (symbolFullName) {
      setOrderCoinType(curCoinValue)
      const newOrderCoinTypes = {
        ...createOrderCoinObj,
        [symbolFullName]: curCoinValue
      }
      globalDispatch({ type: types.SET_ORDER_COIN_TYPE, orderCoinType: newOrderCoinTypes });
    }
  }, [ symbolFullName])

  // 切换下单币种类型
  const handleCoinChange = (val: string, selectOption: any) => {
    const { value } = selectOption;
    const newOrderCoinTypes = {
      ...createOrderCoinObj,
      [symbolFullName]: value
    }
    setOrderCoinType(value)
    globalDispatch({ type: types.SET_ORDER_COIN_TYPE, orderCoinType: newOrderCoinTypes });
    if (handleChange) {
      handleChange(value);
    }
  }

  return (
    <Select
      className={Style['coin-wrapper']}
      suffixIcon={<span className="icon iconfont icon-xia" />}
      value={orderCoinType}
      onChange={handleCoinChange}
    >
      {
        optionList.map(it => {
          const option = t(it.labelKey, { unit: it.value });
          return <Option key={it.value} value={it.value}>
            {option}
          </Option>
        })
      }
    </Select>
  );
}
