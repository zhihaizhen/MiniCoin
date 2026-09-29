import { isString } from '@unified/helpers';
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';

const containerId = 1;
const containerCfg = {
  containerId,
  autoClose: 5000,
  position: 'top-center',
  toastClassName: 'message-toast',
  hideProgressBar: true,
  // closeButton: (<span
  //   className="icon iconfont brand-hover text-secondary f-12 icon-close"
  // />),
  closeButton: false,
  enableMultiContainer: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  closeOnClick: false,
  draggable: false,
};
const toastCfg = { containerId };

export const message = {
  ...['info', 'success', 'warn', 'error'].reduce(
    (prev, cur) => ({
      ...prev,
      [cur](content, cfg) {
        if (!isString(content)) return;
        toast[cur](content, { ...toastCfg, ...cfg });
      },
    }),
    {},
  ),
};

export const MessageContainer = () => <ToastContainer {...containerCfg} />;
