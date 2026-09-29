// import pushEvent from '@region/by-gtm';
import cls from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Style from './setting.module.less'

const ResetGridSetting = ({ onResetGrid }) => {
  const [t] = useTranslation();
  const [isDoing, setIsDoing] = useState(false);

  // 页面布局改变之后重置按钮
  const handleResetGrid = () => {
    if (!isDoing) {
      setIsDoing(true);
     // pushEvent('new_setting', `click`, 'resetGrid');
      onResetGrid();
      setTimeout(() => {
        setIsDoing(false);
      }, 500);
    }
  };

  return (
    <div
      className={cls(Style["setting-grid-reset"],Style["setting-sub-title"])}
      onClick={handleResetGrid}
    >
      <span
        className={Style["setting-icon-reset"]}
      />
      {t('resetPageGrid')}
    </div>
  );
};

ResetGridSetting.defaultProps = {
  onResetGrid: () => {},
};

ResetGridSetting.propTypes = {
  onResetGrid: PropTypes.func,
};

export default ResetGridSetting;
