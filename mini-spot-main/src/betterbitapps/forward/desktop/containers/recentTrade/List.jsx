import React from 'react';
import PropTypes from 'prop-types';
import RtItem from './RtItem';

const List = ({ list, qtyPrecision, lastPricePrecision }) => {
  const listItems = list.map((item, idx) => (
    <RtItem
      key={item.execId}
      {...item}
      qtyPrecision={qtyPrecision}
      lastPricePrecision={lastPricePrecision}

    />
  ));
  return <ul className="rt__body scrollbar-dark">{listItems}</ul>;
};

List.displayName = 'list';

List.defaultProps = {
  list: [],
};

List.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      execId: PropTypes.string,
      tickDirection: PropTypes.string,
      execPrice: PropTypes.string,
      side: PropTypes.string,
      execQty: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      execTime: PropTypes.string,
    }),
  ),
  qtyPrecision: PropTypes.number.isRequired,
  lastPricePrecision: PropTypes.number.isRequired,
};
/**
 * todo:
 * 1.拖拽后动态高度
 * 2.全屏样式缺失
 * 3.icon
 * 4.涨跌样式icon缺失
 */

/* <div className="recent-trade__body" style={{ height: '200px' }}> */
export default React.memo(List);
