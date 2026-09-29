import { ByButton, ByPopover } from '@region/react-ui';
import cs from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import './newFeatTip.css';

// 新增功能提示, 需要测一下新手引导, 否则引导弹框可能会被遮挡部分.
// (特别是交易站可拖拽区域 , 比如 kline, 仓位, ob, recent trade)

const NewFeatTip = ({
  newFeatTipTitle,
  newFeatTipContent,
  newFeatTipBtn,
  newFeatTipImg,
  newFeatTipIcon,
  newFeatTipHideContent,
  byPopoverPlace,
  byPopoverOpenCondition,
  byPopperOptions,
  byPopoverAnchorEl,
  handleFeatTipBtnClick,
  hideInSmallScreen,
  showArrow,
  offsetX,
  offsetY,
}) => {
  return (
    <ByPopover
      placement={byPopoverPlace}
      open={byPopoverOpenCondition}
      popperOptions={byPopperOptions}
      anchorEl={byPopoverAnchorEl}
      showArrow={showArrow}
      popoverClassName={hideInSmallScreen ? 'new-feat-popover__bg-hide' : ''}
      arrowStyle={{
        offsetY,
        offsetX,
      }}
    >
      <If condition={!newFeatTipHideContent}>
        <div
          className={cs('new-feat-tip__bg')}
          onClick={(e) => e.stopPropagation()}
        >
          {/* //注释新功能上线提示 */}
          {/* <div className="new-feat-tip__title nowrap brand">
            <If condition={newFeatTipImg}>
              <img src={newFeatTipImg} className="new-feat-tip__img" alt="" />
              &nbsp;&nbsp;
            </If>
            <If condition={newFeatTipIcon}>
              <span
                className={cs('icon', 'iconfont', 'f-20', newFeatTipIcon)}
              />
              &nbsp;&nbsp;
            </If>
            {newFeatTipTitle}
          </div> */}
          <div className="new-feat-tip__desc">{newFeatTipContent}</div>
          <div className="new-feat-tip__bottom">
            <ByButton onClick={handleFeatTipBtnClick}>{newFeatTipBtn}</ByButton>
          </div>
        </div>
      </If>
    </ByPopover>
  );
};

NewFeatTip.defaultProps = {
  newFeatTipTitle: undefined,
  newFeatTipContent: undefined,
  newFeatTipBtn: undefined,
  newFeatTipImg: undefined,
  newFeatTipIcon: undefined,
  newFeatTipHideContent: undefined,
  byPopoverPlace: undefined,
  byPopoverOpenCondition: undefined,
  byPopperOptions: undefined,
  byPopoverAnchorEl: undefined,
  handleFeatTipBtnClick: undefined,
  hideInSmallScreen: undefined,
  showArrow: false,
  offsetX: 0,
  offsetY: 0,
};

NewFeatTip.propTypes = {
  newFeatTipTitle: PropTypes.string,
  newFeatTipContent: PropTypes.string,
  newFeatTipBtn: PropTypes.string,
  newFeatTipImg: PropTypes.string,
  newFeatTipIcon: PropTypes.string,
  newFeatTipHideContent: PropTypes.bool,
  byPopoverPlace: PropTypes.string,
  byPopoverOpenCondition: PropTypes.bool,
  byPopperOptions: PropTypes.object,
  byPopoverAnchorEl: PropTypes.element,
  handleFeatTipBtnClick: PropTypes.func,
  hideInSmallScreen: PropTypes.bool,
  showArrow: PropTypes.bool,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
};

export default NewFeatTip;
