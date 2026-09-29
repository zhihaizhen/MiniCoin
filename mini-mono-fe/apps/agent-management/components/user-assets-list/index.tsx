//  @ts-nocheck
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import RecordInfo from './record-info';
import Loading from '~/components/loading';
import styles from './index.module.less';
import { gitUserAssetListSev, updateRemarkSev } from '~/api/index';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List, Skeleton, message } from 'antd';
import { Popup, TextArea, Button } from 'antd-mobile';

let UserAssetsList = (props, ref) => {
  const t = useFm();
  const { searchParams, tabIndex } = props;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [needEditCardId, setNeedEditCardId] = useState('');
  const [params, setParams] = useState({});

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    handleRefresh
  }));

  useEffect(() => {
    if (Object.keys(searchParams).length === 0) return;
    if (tabIndex === 1) {
      setRecords([]);
      setTotal(0);
      getUserAssetList({
        ...searchParams,
        page_no: 1,
        page_size: 10
      });
    }
  }, [searchParams, tabIndex]);

  const handClickEdit = (item) => {
    const { user_id, remark = '' } = item;
    setNeedEditCardId(user_id);
    setRemarkText(remark);
    setVisible(true);
  };

  const closePopup = () => {
    setVisible(false);
  };

  const handleSave = () => {
    const params = {
      remark: remarkText,
      user_id: needEditCardId
    };
    updateRemark(params);
  };

  const handleRefresh = () => {
    getUserAssetList({
      ...params,
      page_no: 1,
      page_size: 10
    });
  };

  const loadMore = () => {
    console.log('loadMore');
    getUserAssetList({
      ...params,
      page_no: params.page_no + 1,
      page_size: 10
    });
  };

  const getUserAssetList = async (params) => {
    setParams(params);
    try {
      if (params.page_no === 1) {
        setLoading(true);
      }
      const res = await gitUserAssetListSev(params);
      setLoading(false);
      console.log(res, 'gitUserAssetListSev');
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

  const updateRemark = async (params) => {
    try {
      await updateRemarkSev(params);
      message.success(t('editSuccess'));
      await getUserAssetList({
        ...searchParams,
        page_no: 1,
        page_size: 10
      });
      setVisible(false);
    } catch (e) {
      console.log('错误', e);
      setVisible(false);
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
                  <RecordInfo value={item} handClickEdit={handClickEdit} />
                </List.Item>
              )}
            />
          </InfiniteScroll>
        ) : (
          <Loading />
        )}
      </div>
      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false);
        }}
        onClose={() => {
          setVisible(false);
        }}
        bodyStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          minHeight: '30vh'
        }}
      >
        <div className={styles.popupContainer}>
          <div className={styles.popup_header}>
            <span className={styles.popup_header_title}>
              {t('editRemarks')}
            </span>
            <span
              className={styles.popup_header_close}
              onClick={closePopup}
            ></span>
          </div>
          <div className={styles.content}>
            <TextArea
              maxLength={150}
              placeholder=""
              value={remarkText}
              autoSize={{ minRows: 3, maxRows: 5 }}
              onChange={(val) => {
                setRemarkText(val);
              }}
              style={{
                '--color': '#fff',
                '--font-size': '14px'
              }}
            />
          </div>
          <div className={styles.btn}>
            <Button block shape="rounded" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

UserAssetsList = forwardRef(UserAssetsList);

export default UserAssetsList;
