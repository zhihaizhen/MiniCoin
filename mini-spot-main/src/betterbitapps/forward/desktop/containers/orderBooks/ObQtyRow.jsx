import React, { useEffect, useState } from 'react';
import cls from 'classnames';
import { transformNum } from '@unified/helpers';
import PropTypes from 'prop-types';
import Style from './order-book.module.less';

const ANIME_CLEAR_TIME = 500;

const ObQtyRow = ({ size, inc }) => {

  const rootClass = 'ob__table-qty';
  const [clsname, setClsname] = useState(rootClass);

  useEffect(() => {
    let highlightCls = '';
    if (inc === true) {
      highlightCls = 'ob-highlight--inc';
    } else if (inc === false) {
      highlightCls = 'ob-highlight--dec';
    }
    setClsname(highlightCls);

    // const timer = setTimeout(() => {
    //   setCls(rootClass);
    // }, ANIME_CLEAR_TIME);

    // return () => {
    //   clearTimeout(timer);
    // };
  }, [size, inc]);

  return (
    <div className={cls(Style[rootClass], Style[clsname])}>
      {size}
    </div>
  );
};

ObQtyRow.defaultProps = {
  size: '0',
  inc: undefined,


};

ObQtyRow.propTypes = {
  size: PropTypes.string,
  inc: PropTypes.bool,


};

export default ObQtyRow;
