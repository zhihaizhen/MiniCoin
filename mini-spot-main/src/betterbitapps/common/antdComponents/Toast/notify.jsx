import { isString, map } from '@unified/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { INFO_TYPES } from './constants';

const containerId = 2;
const containerCfg = {
  containerId,
  autoClose: 5000,
  // FIXME: use closeOnClick temporary
  // closeButton: (<span
  //   className="icon iconfont brand-hover text-secondary f-12 icon-close"
  // />),
  closeButton: false,
  position: 'bottom-right',
  hideProgressBar: true,
  enableMultiContainer: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  closeOnClick: true,
  draggable: false,
  limit: 2,
};
const toastCfg = { containerId };

const NotifyContent = ({ type, title, content }) => (
  <div className="notify">
    <p className="notify__title f-16">
      <Choose>
        <When condition={INFO_TYPES.ERROR === type}>
          <span className="f-18 danger icon iconfont icon-false" />
        </When>
        <When condition={INFO_TYPES.WARN === type}>
          <span className="f-18 warn icon iconfont icon-notice" />
        </When>
        <When condition={INFO_TYPES.SUCCESS === type}>
          <span className="f-18 success icon iconfont icon-true" />
        </When>
      </Choose>
      <span>{title}</span>
    </p>
    <p className="text-secondary notify__content">{content}</p>
  </div>
);

NotifyContent.defaultProps = {
  type: INFO_TYPES.INFO,
  title: undefined,
  content: undefined,
};

NotifyContent.propTypes = {
  type: PropTypes.oneOf(map(INFO_TYPES, (val) => val)),
  title: PropTypes.string,
  content: PropTypes.node,
};

let toastId = null;
const successQueue = [];
let intervalTimer = null;
let otherNotifyCount = 0;

const showToast = ({ cur, title, content, cfg }) => {
  toastId = toast[cur](
    <NotifyContent title={title} content={content} type={cur} />,
    {
      ...toastCfg,
      ...cfg,
      onClose: () => {
        toastId = null;
        successQueue.splice(0, 1);
      },
    },
  );
};

const notice = {
  ...['info', 'warn', 'error'].reduce(
    (prev, cur) => ({
      ...prev,
      [cur](title, content, cfg) {
        otherNotifyCount += 1;
        if (!isString(title) || !isString(content)) return;
        toast[cur](
          <NotifyContent title={title} content={content} type={cur} />,
          {
            ...toastCfg,
            ...cfg,
            onClose: () => {
              otherNotifyCount -= 1;
            },
          },
        );
      },
    }),
    {},
  ),
};

notice.success = (title, content, cfg) => {
  if (!isString(title) || !isString(content)) return;
  successQueue.push({
    title,
    content,
    cur: 'success',
    cfg,
  });
  if (!intervalTimer) {
    intervalTimer = setInterval(() => {
      if (successQueue.length > 0) {
        if (!toastId) {
          showToast(successQueue[0]);
        } else if (successQueue.length > 1 && otherNotifyCount === 0) {
          toast.dismiss(toastId);
        }
      } else {
        clearInterval(intervalTimer);
        intervalTimer = null;
      }
    });
  }
};

export const notify = notice;

export const NotifyContainer = () => <ToastContainer {...containerCfg} />;
