import React from 'react';
import { loginUrl, handleLoginUrl, handleDepositUrl } from 'common/utils/url';
import { Button } from 'antd';
import cls from 'classnames';
import Styles from './index.module.less';
import { useTranslation } from 'react-i18next';

import { notify, message } from 'common/antdComponents';

const TradeBtns = ({ loggedIn, needDeposit }) => {
  const [t] = useTranslation();

  const handleStockClosed = () => {
    message.warn(t('tradingHalted'));
  }

  return (
    <div>
      {/* 没有登录的情况下展示去登录 */}
      <If condition={!loggedIn}>
        <a
          href={loginUrl()}
          style={{ textDecoration: 'none', color: 'inherit' }}
          className={Styles.btnContainer}
        >
          <Button
            className={Styles.startBtn}
            type="primary"
            onClick={handleLoginUrl}
          >
            <p className={Styles.startBtnText}>{t('login/sign')}</p>
          </Button>
        </a>
      </If>
      {/* 已登录 */}
      <If condition={loggedIn}>
      
        {/* 没有余额，展示去充值 */}
        <If condition={needDeposit}>
          <div className={Styles.btnContainer}>
            <Button
              className={Styles.startBtn}
              type="primary"
              onClick={() => handleDepositUrl()}
            >
              <p className={Styles.startBtnText}>{t('recharge')}</p>
            </Button>
          </div>
        </If>
      </If>
    </div>
  )
}

export default TradeBtns;