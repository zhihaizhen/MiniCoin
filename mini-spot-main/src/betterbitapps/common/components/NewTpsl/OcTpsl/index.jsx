import { Checkbox } from 'common/antdComponents';
import ProfitInputLabelSelect from 'common/components/ProfitInputLabelSelect';
import { If } from 'common/global/tsx-control-statement/index.d';
import { TP_SL_FORM_FIELDS } from 'common/packages-biz/global-settings/usdt-settings';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clampPrecision } from '../utils/clamp-precision';
import Styles from './index.module.less';

// 触发价允许范围（R1.7）：0.01 ~ 999,999,999.99
const PRICE_MIN = 0.01;
const PRICE_MAX = 999999999.99;

/**
 * OcTpsl —— 内联止盈止损（受控组件）
 *
 * 设计要点：
 * - 受控：自身不持有 Tpsl_Form_State 业务状态，全部经 props 传入、经回调上抛。
 * - 勾选框「止盈/止损」+ 同行常驻「高级」入口；勾选展开后展示止盈、止损两个
 *   纯触发价输入框，右侧不渲染任何价格类型选择控件（R1.5）。
 * - 触发价输入接入 clampPrecision 限制精度（R5.10）；越界/非数字拒绝并提示、
 *   保留原值（R1.7）；清空置空不报错（R1.8）。
 * - useImperativeHandle 暴露 reset()，仅用于折叠 UI 局部瞬态（表单值与勾选态
 *   重置由面板负责）。
 */
const OcTpsl = React.forwardRef((props, ref) => {
  const {
    tpslOrder,
    checked,
    expanded,
    onCheckedChange,
    onFieldChange,
    referencePriceUnavailable,
    tickSizeFraction,
    errors,
  } = props;

  const [t] = useTranslation('spot');

  // 内联即时输入校验的局部错误（R1.7），与面板提交校验 errors 解耦
  const [localErrors, setLocalErrors] = useState({});

  const setLocalError = (field, message) => {
    setLocalErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearLocalError = (field) => {
    setLocalErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // 折叠 UI 局部瞬态：清空内联即时错误提示
  const handleReset = () => {
    setLocalErrors({});
  };

  useImperativeHandle(ref, () => ({
    reset: handleReset,
  }));

  // 触发价输入变更：精度限制 + 范围校验 + 上抛
  const handleTriggerChange = (rawValue, field) => {
    // 清空为空值：置空、不报错（R1.8）
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      clearLocalError(field);
      onFieldChange(undefined, field);
      return;
    }

    // 精度限制到报价精度（R5.10）
    const clamped = clampPrecision(rawValue, tickSizeFraction);
    const num = Number(clamped);

    // 非数字或越界：拒绝输入、提示无效、保留原有值（R1.7）
    if (!Number.isFinite(num) || num < PRICE_MIN || num > PRICE_MAX) {
      setLocalError(field, t('tpslTriggerInvalid'));
      return;
    }

    // 合法：清除错误并写入（R1.6）
    clearLocalError(field);
    onFieldChange(clamped, field);
  };

  // 简化版：内联止盈止损仅编辑触发价，直接绑定止盈/止损触发价字段。
  // 触发价映射为下单接口的 profit_price / stop_price（高级限价委托能力已下线）。
  const tpField = TP_SL_FORM_FIELDS.TP_TRIGGER;
  const slField = TP_SL_FORM_FIELDS.SL_TRIGGER;

  const fieldErrors = errors || {};
  const tpError = localErrors[tpField] || fieldErrors.takeProfit;
  const slError = localErrors[slField] || fieldErrors.stopLoss;

  return (
    <div className={Styles.ocTpslRow}>
      <div className={Styles.ocTpslHeader}>
        <Checkbox
          className={classNames(Styles.orderCheckbox, {
            [Styles.active]: checked,
          })}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
        >
          <span>{t('tpsl')}</span>
        </Checkbox>
      </div>

      <If condition={expanded}>
        <div className={Styles.ocTpslContainer}>
          {/* 止盈：纯输入 */}
          <div className={Styles.ocTp}>
            <ProfitInputLabelSelect
              placeholder={t('takeProfit')}
              name={tpField}
              value={tpslOrder?.[tpField]}
              onChange={handleTriggerChange}
              size="xx-large"
              precision={tickSizeFraction}
            />
            <If condition={!!tpError}>
              <div className={Styles.errorTip}>{tpError}</div>
            </If>
          </div>

          {/* 止损：纯触发价输入 */}
          <div className={Styles.ocSl}>
            <ProfitInputLabelSelect
              placeholder={t('stopLoss')}
              name={slField}
              value={tpslOrder?.[slField]}
              onChange={handleTriggerChange}
              size="xx-large"
              precision={tickSizeFraction}
            />
            <If condition={!!slError}>
              <div className={Styles.errorTip}>{slError}</div>
            </If>
          </div>
        </div>
      </If>
    </div>
  );
});

OcTpsl.displayName = 'OcTpsl';

OcTpsl.defaultProps = {
  tpslOrder: undefined,
  checked: false,
  expanded: false,
  onCheckedChange: undefined,
  onFieldChange: undefined,
  referencePriceUnavailable: false,
  tickSizeFraction: undefined,
  errors: undefined,
};

OcTpsl.propTypes = {
  tpslOrder: PropTypes.object,
  checked: PropTypes.bool,
  expanded: PropTypes.bool,
  onCheckedChange: PropTypes.func,
  onFieldChange: PropTypes.func,
  referencePriceUnavailable: PropTypes.bool,
  tickSizeFraction: PropTypes.number,
  errors: PropTypes.shape({
    takeProfit: PropTypes.string,
    stopLoss: PropTypes.string,
    reference: PropTypes.string,
    general: PropTypes.string,
  }),
};

export default OcTpsl;
