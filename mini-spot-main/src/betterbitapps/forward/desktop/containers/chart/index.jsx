import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Card, Switch } from 'common/antdComponents';
import { useTranslation } from 'react-i18next';
import { GRID_ITEMS } from '@/constants/layout';
import cls from 'classnames';
import DeepChart from './DeepChart';
import Kline from './Kline';
import styles from './index.module.less';

const Chart = ({ onFullScreen, onFullScreenCancel, resize }) => {
  const [t] = useTranslation();
  const [chartType, changeChartType] = useState('k');
  const [full, setFull] = useState(false);

  const changeMode = (isFull) => () => {
    setFull(isFull);
    if (isFull) {
      onFullScreen(GRID_ITEMS.CHART);
    } else {
      onFullScreenCancel(GRID_ITEMS.CHART);
    }
  };

  const head = (  
    <div className={`${styles.chartHead} full flex re-draggable`} style={{ borderRadius: '8px' }}>
      <div>{t('tradingViewChart')}</div>
      <div className={styles.chartHeadRight}>
        <div className={cls(styles.chartHeadRightItem, chartType === 'k' && styles.active)} onClick={() => changeChartType('k')}>{t('tradingview', 'TradingView')}</div>
        <div className={cls(styles.chartHeadRightItem, chartType === 'd' && styles.active)} onClick={() => changeChartType('d')}>{t('Depth')}</div>
      </div>
    </div>
  );

  return (
    <Card className={styles.chart} head={head}>
      <If condition={chartType !== 'k'}>
        <DeepChart resize={resize} />
      </If>
      <If condition={chartType === 'k'}>
        <Kline />
      </If>
    </Card>
  );
};

Chart.defaultProps = {
  onFullScreen: undefined,
  onFullScreenCancel: undefined,
  resize: {},
};

Chart.propTypes = {
  onFullScreen: PropTypes.func,
  onFullScreenCancel: PropTypes.func,
  resize: PropTypes.object,
};

export default Chart;
