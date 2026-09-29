//  @ts-nocheck
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import RecordInfo from './record-info';
import styles from './index.module.less';
import Loading from '~/components/loading';
import { gitUserPnlListSev, updateRemarkSev } from '~/api/index';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List, Skeleton, message } from 'antd';
import { Popup, TextArea, Button, CheckList } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import { plFilterList } from '~/constants';

const defaultSortFiled = 'dt-desc';
const defaultSortName = plFilterList.filter(
  (item) => item.value === defaultSortFiled
)[0].key;

let UserPLRecordsList = (props, ref) => {
  const t = useFm();
  const { searchParams, tabIndex } = props;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [needEditCardId, setNeedEditCardId] = useState('');
  const [selected, setSelected] = useState(defaultSortFiled);
  const [sortName, setSortName] = useState(defaultSortName);
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [params, setParams] = useState({});

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    handleRefresh
  }));

  useEffect(() => {
    if (Object.keys(searchParams).length === 0) return;
    if (tabIndex === 3) {
      resetParams();
      gitUserPnlList({
        ...searchParams,
        page_no: 1,
        page_size: 10,
        order_field: defaultSortFiled
      });
    }
  }, [searchParams, tabIndex]);

  const resetParams = () => {
    setRecords([]);
    setTotal(0);
    setSelected(defaultSortFiled);
    setSortName(defaultSortName);
  };

  const handClickEdit = (item) => {
    const { user_id, remark = '' } = item;
    setNeedEditCardId(user_id);
    setRemarkText(remark);
    setVisible(true);
  };

  const closePopup = () => {
    setVisible(false);
  };

  const openFilterPopup = () => {
    setFilterPopupVisible(true);
  };

  const closeFilterPopup = () => {
    setFilterPopupVisible(false);
  };

  const handleSave = () => {
    const params = {
      remark: remarkText,
      user_id: needEditCardId
    };
    updateRemark(params);
  };

  const handleRefresh = () => {
    console.log(999, '刷新', params);
    gitUserPnlList({
      ...params,
      page_no: 1,
      page_size: 10
    });
  };

  const loadMore = () => {
    console.log('loadMore');
    gitUserPnlList({
      ...params,
      page_no: params.page_no + 1,
      page_size: 10
    });
  };

  const gitUserPnlList = async (params) => {
    console.log(params, 'params');
    setParams(params);
    try {
      if (params.page_no === 1) {
        setLoading(true);
      }

      const res = await gitUserPnlListSev(params);
      setLoading(false);
      console.log(res, 'gitUserPnlListSev');
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
      await gitUserPnlList({
        ...searchParams,
        page_no: 1,
        page_size: 10,
        order_field: selected
      });
      setVisible(false);
    } catch (e) {
      message.error(t('editFailed'));
      setVisible(false);
    }
  };

  return (
    <div className={styles.plRecordsContainer}>
      <div className={styles.filterCard} onClick={openFilterPopup}>
        <span className={styles.filterCard_title}>{t(`${sortName}`)}</span>
        <span className={styles.filterCard_icon} />
      </div>
      <div className={styles.userPLRecordsList} id="userPLRecordsDiv">
        {!loading ? (
          <InfiniteScroll
            dataLength={records.length}
            next={loadMore}
            hasMore={records.length < total}
            loader={<Loading />}
            scrollableTarget="userPLRecordsDiv"
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
      {/* 修改备注的弹窗 */}
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
      <Popup
        visible={filterPopupVisible}
        onMaskClick={() => {
          setFilterPopupVisible(false);
        }}
        destroyOnClose
        bodyStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          minHeight: '30vh'
        }}
      >
        <div className={styles.filterPopupContainer}>
          <div className={styles.content}>
            <CheckList
              activeIcon={<CheckOutline color="var(--text-brand-default)" />}
              className={styles.myCheckList}
              defaultValue={selected ? [selected] : []}
              onChange={(val) => {
                const currentVal = val.length === 0 ? selected : val[0];
                setSelected(currentVal);
                setSortName(
                  plFilterList.filter((item) => item.value === currentVal)[0]
                    .key
                );
                // resetParams();
                gitUserPnlList({
                  ...searchParams,
                  page_no: 1,
                  page_size: 10,
                  order_field: currentVal
                });
                setFilterPopupVisible(false);
              }}
            >
              {plFilterList.map((item) => (
                <CheckList.Item
                  key={item.key}
                  value={item.value}
                  style={{
                    '--active-background-color': '#222'
                  }}
                >
                  {t(`${item.key}`)}
                </CheckList.Item>
              ))}
            </CheckList>
          </div>
          <div className={styles.btn} onClick={closeFilterPopup}>
            {t('cancel')}
          </div>
        </div>
      </Popup>
    </div>
  );
};

UserPLRecordsList = forwardRef(UserPLRecordsList);

export default UserPLRecordsList;
