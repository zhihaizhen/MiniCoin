import { Switch } from 'antd';
import cls from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Style from './setting.module.less'

const SettingItem = ({ data, className, titleClassName, descClassName }) => {

  return (
    <div className={cls(Style["flex-center"], className)}>
      <div>
        <div className={cls(titleClassName)}>{data.title}</div>
        <div className={cls(descClassName)}>{data.desc}</div>
      </div>
      <Switch
        checked={data.toggleVal}
        onChange={data.changeFunc}
        size="small"
        className={Style["setting-toggle"]}
      />
    </div>
  );
};

SettingItem.defaultProps = {
  data: {},
  className: '',
  titleClassName: '',
  descClassName: '',
};

SettingItem.propTypes = {
  data: PropTypes.object,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  descClassName: PropTypes.string,
};

export default SettingItem;
