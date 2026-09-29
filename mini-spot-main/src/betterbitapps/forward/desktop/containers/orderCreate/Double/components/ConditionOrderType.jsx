import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Select, InputNumber } from 'common/antdComponents';
import { ORDER_TYPE } from 'common/packages-biz/global-settings/usdt-settings';
import { ReactComponent as SelectedSvg } from 'common/assets/images/selected.svg';
import Style from './ConditionOrderType.module.less';

// 计划委托-委托类型框：左上角下拉切换 限价委托/市价委托
// 限价委托时为无边框委托价输入框 + 单位，市价委托时展示「市价」文本
const ConditionOrderType = ({
  name,
  conditionType,
  onConditionTypeChange,
  price,
  onPriceChange,
  min,
  max,
  precision,
  rightUnit,
}) => {
  const [t] = useTranslation('spot');

  const typeOptions = useMemo(
    () => [
      { value: ORDER_TYPE.LIMIT, label: t('limitTriggerOption') },
      { value: ORDER_TYPE.MARKET, label: t('marketTriggerOption') },
    ],
    [t],
  );

  const isLimit = conditionType === ORDER_TYPE.LIMIT;

  return (
    <div className={Style.conditionType}>
      <div className={Style.labelRow}>
        <Select
          className={Style.typeSelect}
          dropdownClassName={Style.typeSelectPopup}
          dropdownMatchSelectWidth={false}
          value={conditionType}
          options={typeOptions}
          onChange={onConditionTypeChange}
          bordered={false}
          size="small"
          menuItemSelectedIcon={<SelectedSvg className={Style.selectedIcon} />}
        />
      </div>
      <div className={Style.valueRow}>
        {isLimit ? (
          <>
            <InputNumber
              className={Style.priceInput}
              name={name}
              value={price}
              onChange={onPriceChange}
              min={min}
              max={max}
              precision={precision}
              placeholder="0"
              bordered={false}
            />
            <span className={Style.unit}>{rightUnit}</span>
          </>
        ) : (
          <span className={Style.marketText}>{t('marketOrderShort')}</span>
        )}
      </div>
    </div>
  );
};

ConditionOrderType.defaultProps = {
  name: undefined,
  price: undefined,
  onPriceChange: undefined,
  min: undefined,
  max: undefined,
  precision: undefined,
  rightUnit: undefined,
};

ConditionOrderType.propTypes = {
  name: PropTypes.string,
  conditionType: PropTypes.string.isRequired,
  onConditionTypeChange: PropTypes.func.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPriceChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  precision: PropTypes.number,
  rightUnit: PropTypes.string,
};

export default ConditionOrderType;
