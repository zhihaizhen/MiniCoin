import React from 'react';
import cls from 'classnames';
import './index.less'

export const Switch = ({
  name,
  onChange,
  className,
  values = [],
  loading,
  value,
  size,
  type,
  color,
}) => {
  const clx = cls('switch',
    className,
    size ? `switch--${size}` : undefined,
    type ? `switch--${type}` : undefined,
    color ? `switch--${color}` : undefined,);

  const handleSwitchClick = item => () => {
    if (loading) return;
    if (onChange) onChange(item.value, name, item);
  };

  return (
    <div className={clx}>
      {values.map(it => (
        <div
          key={it.value}
          onClick={handleSwitchClick(it)}
          className={cls('switch__item', {
            'switch__item--active': it.value === value,
          })}
        >
          {// eslint-disable-next-line
            loading && it.value === value ? (
              <span className="circle-loading icon opt-design-iconfont icon--loading" />
            ) : (
              it.label
            )}
        </div>
      ))}
    </div>
  );
};


