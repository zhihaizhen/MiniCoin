import useTimeInForce from '@/hooks/use-time-in-force';
import { Tooltip } from 'antd';
import { Checkbox, Select, Option } from 'common/antdComponents';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@/store';
import { If } from 'common/global/tsx-control-statement/index.d';
import Styles from './index.module.less';

const StrategyType = ({
  postOnly,
  postOnlyDisabled,
  onPostOnlyChange,
  tif,
  tifName,
  onTifChange,
}) => {
  const [t] = useTranslation();
  const timeInForce = useTimeInForce();
  const [globalState] = useGlobalState();

  return (
    <div className={Styles.strategyType}>
      <div>
        <Tooltip
          title={t('postOnlyTips')}
          placement="bottomLeft"
        >
          <Checkbox
            checked={postOnly}
            onChange={e => onPostOnlyChange(e.target.checked)}
            disabled={postOnlyDisabled}
          >
            <span className='dashed-border'>{t('postOnly')}</span>
          </Checkbox>
        </Tooltip>
      </div>

      <div className={Styles.ocTif}>
        <Select
          name={tifName}
          value={tif}
          onChange={onTifChange}
          disabled={ postOnly}
        >
          <For each="it" of={timeInForce}>
            <Option key={it.value} value={it.value}>
              {it.label}
            </Option>
          </For>
        </Select>
      </div>
    </div>
  );
};

StrategyType.defaultProps = {
  postOnlyDisabled: false,
};

StrategyType.propTypes = {
  postOnly: PropTypes.bool.isRequired,
  postOnlyDisabled: PropTypes.bool,
  onPostOnlyChange: PropTypes.func.isRequired,
  tif: PropTypes.string.isRequired,
  tifName: PropTypes.string.isRequired,
  onTifChange: PropTypes.func.isRequired,
};

export default StrategyType;
