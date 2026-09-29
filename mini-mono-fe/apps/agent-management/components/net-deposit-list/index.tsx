//  @ts-nocheck
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import RecordInfo from './record-info';
import Loading from '~/components/loading';
import styles from './index.module.less';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useContextReferral } from '~/context/transactionHistoryContext';
import { getNetDepositList } from '~/api/index';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List, Skeleton, message } from 'antd';

dayjs.extend(utc);
dayjs.extend(timezone);
const curTZ = 'UTC+' + (0 - new Date().getTimezoneOffset() / 60); // 输出：UTC+8
console.log('当前时区', curTZ);
let NetDepositList = (props, ref) => {
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
    // if (Object.keys(searchParams).length === 0) return;
    setRecords([]);
    setTotal(0);
    if (hasAuth) {
      fetchNetDepositList({
        ...searchParams,
        page_no: 1,
        page_size: 10,
        time_zone: curTZ
      });
    }
  }, [searchParams, hasAuth]);

  const handleRefresh = () => {
    fetchNetDepositList({
      ...params,
      page_no: 1,
      page_size: 10
    });
  };

  const loadMore = () => {
    fetchNetDepositList({
      ...params,
      page_no: params.page_no + 1,
      page_size: 10
    });
  };

  // 获取数据
  const fetchNetDepositList = async (params) => {
    setParams(params);
    try {
      if (params.page_no === 1) {
        setLoading(true);
      }
      const res = await getNetDepositList(params);
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

  return (
    <div className={styles.userAssetsContainer}>
      <div className={styles.userAssetsList} id="userAssetsDiv">
        {!loading ? (
          <InfiniteScroll
            dataLength={records.length}
            next={loadMore}
            hasMore={records.length < total}
            loader={<Loading />}
            scrollableTarget="userAssetsDiv"
          >
            <List
              dataSource={records}
              renderItem={(item) => (
                <List.Item key={item} className={styles.listItem}>
                  <RecordInfo value={item} />
                </List.Item>
              )}
            />
          </InfiniteScroll>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};
NetDepositList = forwardRef(NetDepositList);

export default NetDepositList;
