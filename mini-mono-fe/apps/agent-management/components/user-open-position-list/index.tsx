//  @ts-nocheck
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import RecordInfo from './record-info';
import Loading from '~/components/loading';
import styles from './index.module.less';
import { gitUserPositionsListSev, updateRemarkSev } from '~/api/index';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List, Skeleton, message } from 'antd';
import { Popup, TextArea, Button, CheckList } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import { openPositionsFilterList } from '~/constants';

const defaultSortFiled = 'unrealized_pnl-asc';

const defaultSortName = openPositionsFilterList.filter(
  (item) => item.value === defaultSortFiled
)[0].key;

let UserOpenPositionList = (props, ref) => {
  const t = useFm();
  const { searchParams, tabIndex } = props;
  const [records, setRecords] = useState([]);
  const [current, setCurrent] = useState(1);
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
    if (tabIndex === 2) {
      resetParams();
      gitUserPositionsList({
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

  const openFilterPopup = () => {
    setFilterPopupVisible(true);
  };

  const closeFilterPopup = () => {
    setFilterPopupVisible(false);
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
    console.log(999, '刷新', params);
    gitUserPositionsList({
      ...params,
      page_no: 1,
      page_size: 10
    });
  };

  const loadMore = () => {
    console.log('loadMore');
    gitUserPositionsList({
      ...params,
      page_no: params.page_no + 1,
      page_size: 10
    });
  };

  const gitUserPositionsList = async (params) => {
    console.log(params, 'params');
    setParams(params);
    try {
      if (params.page_no === 1) {
        setLoading(true);
      }
      const res = await gitUserPositionsListSev(params);
      setLoading(false);
      console.log(res, 'gitUserPositionsListSev');
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
      await gitUserPositionsList({
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
    <div className={styles.openPositionContainer}>
      <div className={styles.filterCard} onClick={openFilterPopup}>
        <span className={styles.filterCard_title}>{t(`${sortName}`)}</span>
        <span className={styles.filterCard_icon} />
      </div>
      <div className={styles.userOpenPositionList} id="userOpenPositionDiv">
        {!loading ? (
          <InfiniteScroll
            dataLength={records.length}
            next={loadMore}
            hasMore={records.length < total}
            loader={<Loading />}
            scrollableTarget="userOpenPositionDiv"
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
                  openPositionsFilterList.filter(
                    (item) => item.value === currentVal
                  )[0].key
                );
                // resetParams();
                gitUserPositionsList({
                  ...searchParams,
                  page_no: 1,
                  page_size: 10,
                  order_field: currentVal
                });
                setFilterPopupVisible(false);
              }}
            >
              {openPositionsFilterList.map((item) => (
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
UserOpenPositionList = forwardRef(UserOpenPositionList);
export default UserOpenPositionList;
