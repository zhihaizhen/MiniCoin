import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cls from 'classnames';
import './index.less';

const Indicator = ({ activeNums }) => {
  const activeClassName = useMemo(() => {
    switch (activeNums) {
      case 1:
        return 'parallelogram-active1';
      case 2:
        return 'parallelogram-active2';
      case 3:
        return 'parallelogram-active3';
      case 4:
        return 'parallelogram-active4';
      case 5:
        return 'parallelogram-active5';
      default:
        return '';
    }

  }, [activeNums])

  return (
    <div className="indicator">
      {[1, 2, 3, 4, 5].map((it) => (
        <div
          className={cls(
            'parallelogram',
            it <= activeNums ? activeClassName : '',
          )}
          key={it}
        />
      ))}
    </div>
  );
};

Indicator.defaultProps = {
  activeNums: 0,
};

Indicator.propTypes = {
  activeNums: PropTypes.number,
};

export default Indicator;
