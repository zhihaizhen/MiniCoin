import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './foldBox.css';

const FoldBox = ({
  mainContent,
  fixHeight,
  statusKey,
  defaultStatus,
  handleGTM
}) => {
  const [t] = useTranslation();
  const [currentStatus, setCurrentStatus] = useState(
    () => localStorage.getItem(statusKey) || defaultStatus
  );

  const handleStatusBtnClick = () => {
    setCurrentStatus((status) => {
      const updatedStatus = status === 'hide' ? 'show' : 'hide';
      if (handleGTM) {
        handleGTM(updatedStatus); // 埋点
      }
      return updatedStatus;
    });
  };

  // 存储 设置仓位线和快速平仓 快捷操作的状态
  useEffect(() => {
    storage.set(statusKey, currentStatus);
  }, [currentStatus, statusKey]);

  return (
    <div className="fold-box__bg">
      <div
        className="fold-box__element"
        style={{
          height: currentStatus === 'hide' ? `${fixHeight}px` : 'auto'
        }}
      >
        {mainContent}
      </div>

      <If condition={currentStatus === 'hide'}>
        <div className="fold-box__more fold-box__btn-bg">
          <div
            className="fold-box__btn-inline-bg"
            onClick={handleStatusBtnClick}
          >
            <span className="fold-box__btn-txt">{t('foldBoxBtnTxtShow')}</span>
            <span className="icon iconfont icon-zhankai fold-box__btn-icon" />
          </div>
        </div>
      </If>

      <If condition={currentStatus === 'show'}>
        <div className="fold-box__hide fold-box__btn-bg gc-05">
          <div
            className="fold-box__btn-inline-bg"
            onClick={handleStatusBtnClick}
          >
            <span className="fold-box__btn-txt">{t('foldBoxBtnTxtHide')}</span>
            <span className="icon iconfont icon-zhankai fold-box__btn-icon fold-box__btn-show" />
          </div>
        </div>
      </If>
    </div>
  );
};

FoldBox.defaultProps = {
  mainContent: undefined,
  fixHeight: undefined,
  statusKey: undefined,
  defaultStatus: 'show',
  handleGTM: undefined
};

FoldBox.propTypes = {
  mainContent: PropTypes.element,
  fixHeight: PropTypes.number,
  statusKey: PropTypes.string,
  defaultStatus: PropTypes.string,
  handleGTM: PropTypes.func
};

export default FoldBox;
