// 设置kline颜色偏好component, 默认是Green Up/Red Down,设置的颜色保存在本地localstorage
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { eventBus } from 'common/utils/EventBus';
import { ReactComponent as RedGreenSvg } from 'common/assets/images/colorPreference/red-green.svg';
import { ReactComponent as GreenRedSvg } from 'common/assets/images/colorPreference/green-red.svg';
import { ReactComponent as RedBlueSvg } from 'common/assets/images/colorPreference/red-blue.svg';
import classNames from 'classnames';
import { getColorPreference } from '../../utils/getColorPreference';
import Style from './setting.module.less';

const ColorPreference = () => {
  const [t] = useTranslation();
  const [colorPreference, setColorPreference] = useState(getColorPreference());
  const [expanded, setExpanded] = useState(true);

  const colorOptions = useMemo(
    () => [
      {
        label: t('greenUpRedDown'),
        value: 'greenUpRedDown',
        icon: <GreenRedSvg className={Style['color-option-icon']} />,
      },
      {
        label: t('redUpGreenDown'),
        value: 'redUpGreenDown',
        icon: <RedGreenSvg className={Style['color-option-icon']} />,
      },
      {
        label: t('redUpBlueDown'),
        value: 'redUpBlueDown',
        icon: <RedBlueSvg className={Style['color-option-icon']} />,
      },
    ],
    [t],
  );

  useEffect(() => {
    const savedPreference = localStorage.getItem('TRADE_COLOR_PREFERENCE');
    if (savedPreference) {
      setColorPreference(savedPreference);
    }
  }, [localStorage.getItem('TRADE_COLOR_PREFERENCE')]);

  const handleColorPreferenceChange = (value) => {
    setColorPreference(value);
    localStorage.setItem('TRADE_COLOR_PREFERENCE', value);

    const root = document.documentElement;
    root.classList.remove('greenUpRedDown', 'redUpGreenDown', 'redUpBlueDown');
    root.classList.add(value);

    eventBus.emit('colorPreferenceChange', value);
  };

  return (
    <div className={Style['color-preference']}>
      <div
        className={Style['color-preference-header']}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className={Style['color-preference-title']}>{t('colorPreference')}</span>
        <span className={`icon iconfont ${expanded ? 'icon-shang' : 'icon-xia'}`} />
      </div>
      {expanded && (
        <div className={Style['color-preference-cards']}>
          {colorOptions.map((option) => (
            <div
              key={option.value}
              className={classNames(
                Style['color-card'],
                Style[`color-card--${option.value}`],
                {
                  [Style['color-card--selected']]: option.value === colorPreference,
                },
              )}
              onClick={() => handleColorPreferenceChange(option.value)}
            >
              {option.icon}
              <span className={Style['color-card-label']}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPreference;
