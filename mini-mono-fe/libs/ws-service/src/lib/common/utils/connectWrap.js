import _ from 'lodash';
import { connect } from 'react-redux';

export const getProps = (obj) => {
  return (data) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key] = _.get(data, obj[key]);
    });
    return result;
  };
};

export const connectWrap = (props = {}, dispatchMap) => {
  if (typeof props === 'function') {
    return connect(props, dispatchMap, null, { forwardRef: true });
  }
  return connect(getProps(props), dispatchMap, null, { forwardRef: true });
};
