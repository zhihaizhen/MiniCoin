import React, { useState, useRef } from 'react';
import { Tooltip } from 'antd';
import styles from './index.module.less';

interface EllipsisCellProps {
  text: string;
  tooltipClassName?: string;
}

const EllipsisCell: React.FC<EllipsisCellProps> = ({
  text,
  tooltipClassName = 'dca-table-ellipsis-tooltip'
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseEnter = () => {
    if (ref.current && ref.current.scrollWidth > ref.current.clientWidth) {
      setTooltipVisible(true);
    }
  };

  return (
    <Tooltip
      title={text}
      open={tooltipVisible}
      onOpenChange={(open) => { if (!open) setTooltipVisible(false); }}
      placement="topLeft"
      classNames={{ root: tooltipClassName }}
    >
      <span
        ref={ref}
        className={styles.ellipsisCell}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        {text}
      </span>
    </Tooltip>
  );
};

export default EllipsisCell;
