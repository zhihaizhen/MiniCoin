// @ts-ignore
import { Radio } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './index.module.less';

const { Group, Button } = Radio;

// 子 tab 数量徽标文案：非负数直接展示对应数字，非法值（非数字/负数）不展示
const formatBadge = (count) => {
  const num = Number(count);
  return Number.isFinite(num) && num >= 0 ? String(num) : '';
};

/**
 * 委托列表筛选子 tab（限价｜市价 / 止盈止损 / 计划委托）
 * 当前委托与历史委托共用。
 */
const EntrustFilterTabs = (props) => {
  const { tabList, value, onChange, getTabNum, className } = props;
  const [t] = useTranslation();

  return (
    <div className={`${Styles.head} ${className || ''}`}>
      <Group className={Styles.typeBtn} onChange={onChange} value={value}>
        {tabList.map((it) => {
          const badge = formatBadge(getTabNum[it.key]);
          return (
            <Button key={it.key} value={it.key}>
              {t(it.label)}
              {badge && <span className={Styles.count}>{`(${badge})`}</span>}
            </Button>
          );
        })}
      </Group>
    </div>
  );
};

EntrustFilterTabs.propTypes = {
  tabList: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  getTabNum: PropTypes.object,
  className: PropTypes.string,
};

EntrustFilterTabs.defaultProps = {
  getTabNum: {},
  className: '',
};

export default EntrustFilterTabs;
