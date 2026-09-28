import { types, useGlobalState } from '@/store';
import { Modal } from 'common/antdComponents';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Style from './index.module.less';

const Reconnect = () => {
  const [globalState, globalDispatch] = useGlobalState();
  const [show, setShow] = useState(globalState.offline);
  const [t] = useTranslation();
  const timerRef = useRef(null);
  const hideByReconnect = () => {
    setShow(false);
    globalDispatch({ type: types.NETWORK_CHANGE, show: false });
  };
  useEffect(() => {
    const time = show ? 500 : 5000;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShow(globalState.offline);
      timerRef.current = null;
    }, time);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [globalState.offline, show]);

  return (
    <Modal centered closable={false} innerClass={Style['reconnect-modal']} open={show} footer={null}>
      <div className={Style.dialog}>
        <div className={Style.title}>
          <p>{t('reconnectTit', { value: process.env.MARVEL_APP_TITLE })}</p>
          <span
            className={`icon iconfont icon-close ${Style.close}`}
            onClick={hideByReconnect}
          />
        </div>
        <div className={Style.content}>
          <p>{t('reconnectC1')}</p>
          <div className={`${Style["ivu-progress"]} ${Style["ivu-progress-active"]}`}>
            <div className={Style["ivu-progress-outer"]}>
              <div className={Style["ivu-progress-inner"]}>
                <div className={Style["ivu-progress-bg"]} />
                <div className={Style["ivu-progress-success-bg"]} />
              </div>
            </div>
          </div>
          <p>{t('reconnectC2')}</p>
        </div>
      </div>
    </Modal>
  );
};
Reconnect.defaultProps = {};

Reconnect.propTypes = {};

export default Reconnect;
