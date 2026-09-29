// 表头上的撤销全部
import { Button } from 'antd';
import cls from 'classnames';
import { USER_SETTINGS } from 'common/packages-biz/global-settings';
import { Checkbox, Modal, notify } from 'common/antdComponents';
import { cancelAllOrder, cancelAllPlanOrder } from '@/services/order.service';
import estimator from 'common/utils/estimator';
import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store-hooks/use-user-store';
import { types, useGlobalState } from '@/store';
import { ReactComponent as WarningSvg } from 'common/assets/images/warning-cancel-order.svg'
import {
  saveDoubleConfirm,
  refreshCurrentEntrustList,
  refreshCurrentPlanFamilyLists,
} from '@/services/user.service';
import { PLAN_TYPE } from '../../constant';
import Style from './index.module.less';


const orderTypeMap = {
  'Activity': 'limitEntrust',
  'NormalConditional': 'conditionalOrder',
  'Plan': 'triggerEntrust',
  'Tpsl': 'tpslEntrust',
}

const cancelAllConfirmSave = (doubleConfirmData) =>
  (doubleConfirmData || '')
    .split(USER_SETTINGS.CANCEL_ALL_CONFIRM)
    .join('')
    .split(',')
    .filter((val) => val);
function CancelAll({ list, filterValue, type }) {
  const [t] = useTranslation();
  const [globalState, globalDispatch] = useGlobalState();
  const {  allSpotTokenConfig,walletCoin, symbol, symbolAlias, user } = globalState;
  const { cancelAllConfirm, doubleConfirm } = useUserStore();

  const [postLoading, setPostLoading] = useState(false);
  const [cancelProps, setCancelProps] = useState(null);
  const [cancelAllConfirmCheck, setCancelAllConfirmCheck] = useState(false);
  const disableCancelAll = list.length < 1;

  const cancelAll = () => {
    setPostLoading(true);
    const params = {
      type,
    }
    // filterValue有值，代表撤销当前币种的单子，否则撤销所有币种的单子
    if (filterValue) {
      params.symbol = filterValue
    } else {
      params.filter = 'all'
    }

    // 限价市价（Activity）只需撤 order 家族；计划委托（Plan）/止盈止损（Tpsl）
    // 均为 plan_order 独立接口数据，按 plan_type 撤销该分类下的计划单
    // （Plan: NORMAL，Tpsl: PROFIT_OR_STOP）。「仅当前交易对」勾选（filterValue
    // 有值）时附带 symbol_id 限定当前交易对，未勾选则不传 symbol_id，撤销全部交易对
    let cancelAllPromise;
    if (type === 'Plan' || type === 'Tpsl') {
      const planType =
        type === 'Plan' ? PLAN_TYPE.NORMAL : PLAN_TYPE.PROFIT_OR_STOP;
      cancelAllPromise = cancelAllPlanOrder({
        plan_type: planType,
        ...(filterValue ? { symbol_id: symbolAlias } : {}),
      });
    } else {
      cancelAllPromise = cancelAllOrder(params);
    }

    cancelAllPromise
      .then(() => {
        const title = t('CancelAllSuccess');
        let desc = '';
        if (type === 'Activity') {
          desc = t('CancelActiveSuccess');
        } else {
          desc = t('CancelConditionalSuccess');
        }
        notify.success(title, desc);

        // 撤销全部成功后主动刷新对应列表，WS 推送不总是可靠（与单个撤单一致）
        const accountId = user?.userInfo?.defaultAccountId;
        if (type === 'Activity') {
          refreshCurrentEntrustList(symbol, globalDispatch, accountId).catch(() => {});
        } else if (type === 'Plan' || type === 'Tpsl') {
          // 计划委托 / 止盈止损：一次拉合集，按 plan_type 更新两桶
          refreshCurrentPlanFamilyLists(symbol, globalDispatch, accountId).catch(() => {});
        }
      })
      .catch(() => {
        const title = t('CancelFailure');
        notify.error(title, '');
      })
      .finally(() => {
        setPostLoading(false);
        setCancelProps(null);
        setCancelAllConfirmCheck(false);
      });
  };

  const handleCancelConfirm = estimator('pc cancelAll confirm', () => {
    if (cancelAllConfirmCheck) {
      const newDoubleConfirm = cancelAllConfirmSave(doubleConfirm);
      saveDoubleConfirm(newDoubleConfirm).then(() => {
        globalDispatch({
          type: types.UPDATE_ORDER_CONFIRM,
          newDoubleConfirm: newDoubleConfirm.join(','),
        });
      });
    }
    cancelAll();
  });

  const showSymbolText = useMemo(() => {
    if (filterValue) {
      const { symbolAlias } = allSpotTokenConfig?.[walletCoin]?.[filterValue] || {};
      return symbolAlias;
    }

    if (!filterValue) {
      return 'allSymbolFilter'
    }
    return ''
  }, [ filterValue])


  return (
    <div className={Style.cancelAllBtn}>
      {/* 撤销全部的按钮 */}
      <Button
        type="text"
        loading={postLoading}
        color="primary"
        disabled={disableCancelAll}
        onClick={estimator('usdt cancelAll', () => {
          if (disableCancelAll) return;
          if (cancelAllConfirm) {
            setCancelProps({
              title: t('CancelAllConfirm', {
                type:
                  type === 'Activity' ? t('Active') : t('Conditional'),
              }),
              type,
            });
            return;
          }
          cancelAll();
        })}
      >
        <span> {t('batchCancel')}</span>
      </Button>
      {/* 撤销全部的确认弹窗 */}
      <Modal
        open={!!cancelProps}
        head={null}
        closable={false}
        confirming={postLoading}
        width={390}
        confirmText={t('confirm')}
        onConfirm={handleCancelConfirm}
        cancelText={t('cancel')}
        onCancel={() => {
          setCancelProps(null);
          setCancelAllConfirmCheck(false);
        }}
      >
        <div className={Style.context}>
          <div className={Style.warnTop}>
            <WarningSvg className={Style.warnIcon} />
            <div className={Style.cancelText}>{t('batchCancelOrderConfirm')}</div>
          </div>
          <div className={cls(Style.item, Style.mb8)}>
            <span>{t('orderType')}</span>
            <span>{t(orderTypeMap?.[type])}</span>
          </div>
          <div className={Style.item}>
            <span>{t('orderSymbol')}</span>
            <span>{t(showSymbolText)}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

CancelAll.defaultProps = {
  type: '',
  list: [],
  filterValue: '',
};

CancelAll.propTypes = {
  type: PropTypes.string,
  list: PropTypes.array,
  filterValue: PropTypes.string,
};

export default CancelAll;
