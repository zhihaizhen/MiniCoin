import { FC, useState } from 'react';
import styles from './index.module.less';

interface ISubPageHeaderProps {
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  width: number | string;
}

const Tooltip: FC<ISubPageHeaderProps> = ({
  title = '',
  width = '100%',
  children
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const widthStr = () => {
    if (typeof width === 'number') {
      return `${width}px`;
    }

    return width;
  };

  const rightStr = () => {
    if (typeof width === 'number') {
      return `-${width - 20}px`;
    }

    return '48%';
  };

  const arrowLeftStr = () => {
    if (typeof width === 'number') {
      return `${width * 0.14}px`;
    }

    return '48%';
  };

  const handleHover = () => {
    setShowTooltip(true);
  };

  const handleHoverOver = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className={styles.tooltip}
      onMouseOver={handleHover}
      onClick={handleHover}
      onMouseLeave={handleHoverOver}
    >
      {children}
      {showTooltip && (
        <div
          className={styles.tooltip_popover}
          style={{ width: widthStr(), right: rightStr() }}
        >
          {title}
          <div
            className={styles.tooltip_popover_arrow}
            style={{ left: arrowLeftStr() }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
