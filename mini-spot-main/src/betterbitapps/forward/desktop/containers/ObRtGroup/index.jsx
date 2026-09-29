import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'common/antdComponents';
import Orderbook from '../orderBooks';
import RecentTrade from '../recentTrade';
import styles from './index.module.less';
import './index.css';

const renderTabBar = (tabBarProps, DefaultTabBar) => (
  <DefaultTabBar
    {...tabBarProps}
    className={[tabBarProps.className, 're-draggable'].filter(Boolean).join(' ')}
  />
);

function ObRtGroup(props) {
  const [t] = useTranslation();

  const items = [
    {
      key: '1',
      label: t('orderbook'),
      children: <Orderbook {...props} />,
      forceRender: true,
    },
    {
      key: '2',
      label: t('RecentTrades'),
      children: <RecentTrade />,
      forceRender: true,
    },
  ];

  return (
    <Tabs
      className={styles.container}
      defaultActiveKey="1"
      items={items}
      renderTabBar={renderTabBar}
    />
  );
}

ObRtGroup.defaultProps = {
  width: 2,
  height: 12,
};

ObRtGroup.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default ObRtGroup;
