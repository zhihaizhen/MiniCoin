import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import './index.module.less';

const sortTypeList = ['NORMAL', 'UP', 'DOWN'];

const SymbolSort = ({ txt, sortType, sortColumn, onSort }) => {
  const [pointFlag, setPointFlag] = useState(false);
  const handleSort = (type) => {
    onSort(sortColumn, type);
  };

  return (
    <div
      className="book-symbol-table__thead-th"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="symbol-sort__txt f-12"
        onClick={(e) => {
          handleSort(
            pointFlag
              ? 'NORMAL'
              : sortTypeList[(sortTypeList.indexOf(sortType) + 1) % 3],
          );
          setPointFlag(false);
        }}
      >
        {txt}
      </span>
      <span className="symbol-sort__ctr">
        <span
          className={classNames('symbol-sort__sort-btn', {
            'symbol-sort__type--sort': sortType === 'UP',
          })}
          onClick={() => {
            setPointFlag(true);
            handleSort('UP');
          }}
        />
        <span
          className={classNames('symbol-sort__sort-btn--down', {
            'symbol-sort__type--sort': sortType === 'DOWN',
          })}
          onClick={() => {
            setPointFlag(true);
            handleSort('DOWN');
          }}
        />
      </span>
    </div>
  );
};

SymbolSort.defaultProps = {
  txt: '',
  sortType: 'NORMAL',
  sortColumn: '',
  onSort: () => {},
};

SymbolSort.propTypes = {
  txt: PropTypes.string,
  sortType: PropTypes.string, // NORMAL - 默认  UP - 升序 DOWN - 降序
  sortColumn: PropTypes.string,
  onSort: PropTypes.func,
};

export default SymbolSort;
