// import pushEvent from '@region/by-gtm';
import { Env } from '@region-lib/env';
import { Tooltip } from 'antd'
import { storage } from 'by-storage';
import classNames from 'classnames';
import { THEMES } from 'common/packages-biz/global-settings';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { types, useGlobalState } from '@/store';
import './theme.css';

const Theme = (props) => {
  const { THEME_KEY } = Env;
  const { theme } = props;
  const [t] = useTranslation();
  const [, globalDispatch] = useGlobalState();

  const targetThemeName = useMemo(() => {
    return theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  }, [theme]);

  const handleThemeIconClick = debounce(() => {
    // pushEvent ('click', `theme_${targetThemeName}`, '');
    globalDispatch({ type: types.SET_CURRENT_THEME, targetThemeName });
    storage.set(THEME_KEY, targetThemeName);
  }, 500);


  useEffect(() => {
    document.getElementsByTagName('html')[0].className = `theme-${theme} theme-trade`;
  }, [theme]);

  return (
    <Tooltip
      placement="leftTop"
      title=
      {targetThemeName === THEMES.DARK
        ? t('darkThemeTips')
        : t('lightThemeTips')}
    >
      <span
        className={classNames(
          'f-20',
          'icon',
          'iconfont',
          `icon-${targetThemeName}`,
          'setting__theme',
          'brand-hover',
        )}
        onClick={handleThemeIconClick}
      />
    </Tooltip>
  );
};

Theme.defaultProps = {
  theme: THEMES.LIGHT,
};

Theme.propTypes = {
  theme: PropTypes.string,
};

export default Theme;
