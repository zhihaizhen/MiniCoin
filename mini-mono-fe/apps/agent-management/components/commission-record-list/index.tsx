//  @ts-nocheck
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import RecordInfo from './record-info';
import Loading from '~/components/loading';
import styles from './index.module.less';
import { getCommissionHistorySev } from '~/api/index';
import { useContextReferral } from '~/context/transactionHistoryContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List, Skeleton } from 'antd';

let CommissionRecordList = (props, ref) => {
  const t = useFm();
  const { searchParams } = props;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({});
  const { hasAuth } = useContextReferral();

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    handleRefresh
  }));

  useEffect(() => {
    setRecords([]);
    setTotal(0);
    if (hasAuth) {
      fetchHistory({
        ...searchParams,
        page_no: 1,
        page_size: 10
      });
    }
  }, [searchParams, hasAuth]);

  const fetchHistory = async (params) => {
    console.log(params, 'params');
    setParams(params);
    try {
      if (params.page_no === 1) {
        setLoading(true);
      }

      const res = await getCommissionHistorySev(params);
      setLoading(false);
      if (params.page_no === 1) {
        setRecords(res.records);
      } else {
        setRecords([...records, ...res.records]);
      }
      setTotal(res.total);
    } catch (e) {
      setLoading(false);
      console.warn(e);
    }
  };

  const loadMore = () => {
    fetchHistory({
      ...params,
      page_no: params.page_no + 1,
      page_size: 10
    });
  };

  const handleRefresh = () => {
    fetchHistory({
      ...params,
      page_no: 1,
      page_size: 10
    });
  };

  return (
    <div className={styles.CommissionRecordList} id="scrollableDiv">
      {!loading ? (
        <InfiniteScroll
          dataLength={records.length}
          next={loadMore}
          hasMore={records.length < total}
          loader={<Loading />}
          scrollableTarget="scrollableDiv"
        >
          <List
            dataSource={records}
            renderItem={(item) => (
              <List.Item key={item}>
                <RecordInfo value={item} />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      ) : (
        <Loading />
      )}
    </div>
  );
};

CommissionRecordList = forwardRef(CommissionRecordList);

export default CommissionRecordList;
