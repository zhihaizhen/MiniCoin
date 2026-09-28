import { Modal } from 'common/antdComponents';
import { Button } from 'antd';
import { sessionStorage } from 'by-storage';
import { SESSION_SHOW_LOCALTIM_TIPS } from 'common/packages-biz/global-settings/localStorageSettings';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const HAS_SHOW_TIPS = '1';

const LocalTimeTips = ({ showTips, setShowTips }) => {
  const [t] = useTranslation();
  const handleGotIt = () => {
    setShowTips(false);
    sessionStorage.set(SESSION_SHOW_LOCALTIM_TIPS, HAS_SHOW_TIPS);
  };

  return (
    <Modal
      className="local-time-tips__mask"
      width={440}
      innerClass="local-time-tips__ctr"
      head={t('orderLineTipInfo')}
      open={showTips}
      onClose={handleGotIt}
      footer={null}
    >
      <div>{t('localTimeTips')}</div>
      <Button className='local-time-tips__btn' onClick={handleGotIt} type="primary">{t('confirm')}</Button>
    </Modal>
  );
};

LocalTimeTips.defaultProps = {
  showTips: false,
  setShowTips: () => { },
};

LocalTimeTips.propTypes = {
  showTips: PropTypes.bool,
  setShowTips: PropTypes.func,
};

export default LocalTimeTips;
