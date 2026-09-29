import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, Checkbox } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import { ReactComponent as SearchIcon } from '~/public/icons/search.svg';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { useAllSpotQuote } from 'libs/ws-service';
import { getDcaConfig } from '~/api';
import styles from './index.module.less';

const MAX_COINS = 10;

type SortKey = 'symbol' | 'price' | 'change';
type SortDir = 'none' | 'asc' | 'desc';

const SortIcon: React.FC<{ active: boolean; dir: SortDir }> = ({ active, dir }) => {
  const upColor = active && dir === 'asc' ? 'var(--text-primary, #f5f5f5)' : 'var(--text-secondary, #808588)';
  const downColor = active && dir === 'desc' ? 'var(--text-primary, #f5f5f5)' : 'var(--text-secondary, #808588)';
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M6 2L9 5.5H3L6 2Z" fill={upColor} />
      <path d="M6 10L3 6.5H9L6 10Z" fill={downColor} />
    </svg>
  );
};

interface CoinSelectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (symbols: string[]) => void;
  selectedSymbols: string[];
}

const CoinSelectModal: React.FC<CoinSelectModalProps> = ({
  open,
  onClose,
  onConfirm,
  selectedSymbols
}) => {
  const t = useFm();
  const { allSpotList } = useAllSpotQuote();
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('none');
  const [onlineTokens, setOnlineTokens] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setChecked([...selectedSymbols]);
      setSearch('');
      getDcaConfig().then((res: any) => {
        const tokens = (res?.tokens || [])
          .filter((t: any) => t.tokenStatus === 'online')
          .map((t: any) => t.tokenId);
        setOnlineTokens(tokens);
      }).catch(() => {});
    }
  }, [open, selectedSymbols]);

  const coinOptions = useMemo(() => {
    if (!allSpotList || allSpotList.length === 0 || onlineTokens.length === 0) return [];
    const map = new Map<string, any>();
    allSpotList.forEach((item: any) => {
      const base = item?.baseTokenId || '';
      if (base && !map.has(base) && onlineTokens.includes(base)) {
        map.set(base, {
          symbol: base,
          lastPrice: item.formattedLastPrice || '--',
          changeRate: item.changeRate24H || '0.00'
        });
      }
    });
    return Array.from(map.values());
  }, [allSpotList, onlineTokens]);

  const filteredCoins = useMemo(() => {
    const keyword = search.toUpperCase();
    const list = search
      ? coinOptions.filter(c => c.symbol.toUpperCase().includes(keyword))
      : coinOptions;

    if (!sortKey || sortDir === 'none') return list;

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'symbol') {
        cmp = a.symbol.localeCompare(b.symbol);
      } else if (sortKey === 'price') {
        cmp = parseFloat(a.lastPrice) - parseFloat(b.lastPrice);
      } else if (sortKey === 'change') {
        cmp = parseFloat(a.changeRate) - parseFloat(b.changeRate);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [coinOptions, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir(prev => {
        if (prev === 'none') return 'asc';
        if (prev === 'asc') return 'desc';
        return 'none';
      });
    }
  };

  const handleToggle = (symbol: string) => {
    if (checked.includes(symbol)) {
      setChecked(checked.filter(s => s !== symbol));
    } else {
      if (checked.length >= MAX_COINS) return;
      setChecked([...checked, symbol]);
    }
  };

  const handleRemoveTag = (symbol: string) => {
    setChecked(checked.filter(s => s !== symbol));
  };

  const handleConfirm = () => {
    onConfirm(checked);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={438}
      zIndex={1060}
      className={styles.coinSelectModal}
      destroyOnHidden
      maskClosable={false}
    >
      <div className={styles.coinSelectHead}>
        <h3 className={styles.coinSelectTitle}>{t('add-coin')}</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <div className={styles.coinSelectBody}>
        <Input
          className={styles.coinSearchInput}
          placeholder={t('search-coin')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchIcon className={styles.searchIcon} />}
          allowClear
        />

        <div
          className={styles.coinSelectTip}
          dangerouslySetInnerHTML={{
            __html: t('max-select-tip')
              .replace('{count}', String(checked.length))
              .replace('{max}', String(MAX_COINS))
          }}
        />

        {checked.length > 0 && (
          <div className={styles.coinTagList}>
            {checked.map(symbol => (
              <span key={symbol} className={styles.coinTag}>
                {symbol}
                <span className={styles.coinTagClose} onClick={() => handleRemoveTag(symbol)}>×</span>
              </span>
            ))}
          </div>
        )}

        <div className={styles.coinListHeader}>
          <button className={styles.sortBtn} onClick={() => handleSort('symbol')}>
            <span className={sortKey === 'symbol' && sortDir !== 'none' ? styles.sortLabelActive : ''}>{t('coin-symbol')}</span>
            <SortIcon active={sortKey === 'symbol'} dir={sortKey === 'symbol' ? sortDir : 'none'} />
          </button>
          <div className={styles.sortRight}>
            <button className={styles.sortBtn} onClick={() => handleSort('price')}>
              <span className={sortKey === 'price' && sortDir !== 'none' ? styles.sortLabelActive : ''}>{t('latest-price')}</span>
              <SortIcon active={sortKey === 'price'} dir={sortKey === 'price' ? sortDir : 'none'} />
            </button>
            <span className={styles.sortDivider}>/</span>
            <button className={styles.sortBtn} onClick={() => handleSort('change')}>
              <span className={sortKey === 'change' && sortDir !== 'none' ? styles.sortLabelActive : ''}>{t('change-rate')}</span>
              <SortIcon active={sortKey === 'change'} dir={sortKey === 'change' ? sortDir : 'none'} />
            </button>
          </div>
        </div>

        <div className={styles.coinListScroll}>
          {filteredCoins.map(coin => {
            const isChecked = checked.includes(coin.symbol);
            const changeNum = parseFloat(coin.changeRate);
            const isPositive = changeNum >= 0;
            return (
              <div
                key={coin.symbol}
                className={styles.coinListItem}
                onClick={() => handleToggle(coin.symbol)}
              >
                <div className={styles.coinListLeft}>
                  <Checkbox checked={isChecked} />
                  <img className={styles.coinListIcon} src={getSymbolUrl(coin.symbol)} alt={coin.symbol} />
                  <span className={styles.coinListName}>{coin.symbol}</span>
                </div>
                <div className={styles.coinListRight}>
                  <span className={styles.coinListPrice}>{coin.lastPrice}</span>
                  <span className={`${styles.coinListChange} ${isPositive ? styles.positive : styles.negative}`}>
                    {isPositive ? '+' : ''}{coin.changeRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.coinSelectFooter}>
        <button className={styles.coinSelectConfirmBtn} onClick={handleConfirm}>
          {t('confirm')}（{t('selected-count', { count: checked.length })}）
        </button>
      </div>
    </Modal>
  );
};

export default CoinSelectModal;
