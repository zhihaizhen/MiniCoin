import React from 'react';
import { Pagination } from 'antd';
import styles from './index.module.less';

interface AppPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

const AppPagination: React.FC<AppPaginationProps> = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className={styles.paginationWrapper}>
      <Pagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger={false}
        className={styles.pagination}
      />
    </div>
  );
};

export default AppPagination;
