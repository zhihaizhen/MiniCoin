import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import cls from 'classnames';
import { getSymbolUrl, getLang } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

export interface RankItem {
  symbol: string;
  symbolAlias?: string;
  formattedLastPrice?: string;
  changeRate24H?: number;
  formattedTurnover24h?: string;
  turnover24h?: number | string;
}

interface RankBoardProps {
  title: string;
  list: RankItem[];
  renderSecond?: (item: RankItem) => ReactNode;
  renderThird: (item: RankItem) => ReactNode;
}

const SymbolText = ({ text }: { text: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (visible: boolean) => {
    if (!visible) {
      setOpen(false);
      return;
    }
    const el = ref.current;
    setOpen(!!el && el.scrollWidth > el.clientWidth);
  };

  return (
    <Tooltip
      title={text}
      placement="top"
      mouseEnterDelay={0.3}
      open={open}
      onOpenChange={handleOpenChange}
      overlayClassName={styles.symbolTooltip}
    >
      <span
        ref={ref}
        className={cls(styles.symbol, {
          [styles.symbolSmall]: text.length > 7
        })}
      >
        {text}
      </span>
    </Tooltip>
  );
};

const RankBoard = ({
  title,
  list,
  renderSecond,
  renderThird
}: RankBoardProps) => {
  const leftList = useMemo(() => list.slice(0, 3), [list]);
  const rightList = useMemo(() => list.slice(3, 6), [list]);

  const handleRowClick = (item: RankItem) => {
    const lang = getLang();
    const showSymbol = item.symbolAlias || item.symbol;
    window.location.href = `/${lang}/trade/usdt/${showSymbol}`;
  };

  const renderRow = (item: RankItem) => {
    const showSymbol = item.symbolAlias || item.symbol;
    return (
      <div
        key={item.symbol}
        className={styles.row}
        onClick={() => handleRowClick(item)}
      >
        <div className={styles.coinCol}>
          <img
            className={styles.icon}
            src={getSymbolUrl(showSymbol)}
            alt={showSymbol}
          />
          <SymbolText text={showSymbol} />
        </div>
        <div className={styles.priceCol}>
          {renderSecond
            ? renderSecond(item)
            : item.formattedLastPrice || '--'}
        </div>
        <div className={styles.thirdCol}>{renderThird(item)}</div>
      </div>
    );
  };

  return (
    <div className={styles.rankBoard}>
      <div className={styles.title}>{title}</div>
      <div className={styles.columns}>
        <div className={styles.column}>{leftList.map(renderRow)}</div>
        <div className={styles.column}>{rightList.map(renderRow)}</div>
      </div>
    </div>
  );
};

export default RankBoard;
