import React from 'react';
import { Modal } from 'common/antdComponents';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as RiskWarning } from 'common/assets/images/attention-warning.svg';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import Style from './index.module.css';

const RiskTips = () => {
  const { riskTags } = useCurSymbolConfig();
  const [t] = useTranslation();

  return (
    <div className={Style.riskTips}>
      {riskTags.map((item) => (
        <div className={Style.riskTipItem} key={item}>
          <RiskWarning />
          {t(`ztsl_error_code:symbol_risk_label_${item}`)}
        </div>
      ))}
    </div>
  );
};
RiskTips.defaultProps = {};

RiskTips.propTypes = {};

export default RiskTips;
