//  @ts-nocheck
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import RecordInfo from './record-info';
import cls from 'classnames';
import Loading from '~/components/loading';
import styles from './index.module.less';
import { getUserOverviewListSev, updateRemarkSev } from '~/api/index';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, List, Skeleton, message } from 'antd';
import { Popup, TextArea, Button, CheckList, Checkbox } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import { rankFilterList } from '~/constants';
import { useContextReferral } from '~/context/transactionHistoryContext';
const defaultSortFiled = 'registration_time-desc';

const defaultSortName = rankFilterList.filter(
  (item) => item.value === defaultSortFiled
)[0].key;

let UserOverviewList = (props, ref) => {
  const t = useFm();
  const { searchParams, goToOpenPosition, goToPlRecord, tabIndex } = props;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [needEditCardId, setNeedEditCardId] = useState('');
  const [selected, setSelected] = useState(defaultSortFiled); //选中的过滤条件的key
  const [sortName, setSortName] = useState(defaultSortName); //选中的值的label
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [hiddlePnl, setHiddlePnl] = useState(0); //隐藏为0的pnl
  const [hiddleUPnl, setHiddleUPnl] = useState(0); //隐藏为0的upnl
  const [params, setParams] = useState({});
  const { hasAuth } = useContextReferral();

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    handleRefresh
  }));

  useEffect(() => {
    if (Object.keys(searchParams).length === 0) return;
    if (tabIndex === 0) {
      resetParams();
      if (hasAuth) {
        getUserOverviewList({
          ...searchParams,
          page_no: 1,
          page_size: 10,
          order_field: defaultSortFiled,
          hide_zero_unrealized_pnl: hiddleUPnl ? 1 : 0,
          hide_zero_realized_pnl: hiddlePnl ? 1 : 0
        });
      }
    }
    return () => {
      setRecords([]);
    };
  }, [searchParams, tabIndex, hasAuth]);

  const handleRefresh = () => {
    getUserOverviewList({
      ...params,
      page_no: 1,
      page_size: 10
    });
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

  const loadMore = () => {
    getUserOverviewList({
      ...params,
      page_no: params.page_no + 1,
      page_size: 10
    });
  };
  // 获取数据
  const getUserOverviewList = async (params) => {
    setParams(params);
    try {
      if (params.page_no === 1) {
        setLoading(true);
      }
      const res = await getUserOverviewListSev(params);
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

  const updateRemark = async (params) => {
    try {
      await updateRemarkSev(params);
      message.success(t('editSuccess'));
      getUserOverviewList({
        ...searchParams,
        page_no: 1,
        page_size: 10,
        order_field: selected,
        hide_zero_unrealized_pnl: hiddleUPnl ? 1 : 0,
        hide_zero_realized_pnl: hiddlePnl ? 1 : 0
      });
      setVisible(false);
    } catch (e) {
      message.error(t('editFailed'));
      setVisible(false);
    }
  };

  const resetParams = () => {
    setRecords([]);
    setTotal(0);
    setSelected(defaultSortFiled);
    setSortName(defaultSortName);
    // setHiddleUPnl(1);
    // setHiddlePnl(1);
  }; //切换tab的时候才需要吧

  const handleChangeFilter = (val) => {
    const currentVal = val.length === 0 ? selected : val[0];
    setSelected(currentVal);
    setSortName(
      rankFilterList.filter((item) => item.value === currentVal)[0].key
    );
    getUserOverviewList({
      ...searchParams,
      page_no: 1,
      page_size: 10,
      order_field: currentVal,
      hide_zero_unrealized_pnl: hiddleUPnl ? 1 : 0,
      hide_zero_realized_pnl: hiddlePnl ? 1 : 0
    });
    setFilterPopupVisible(false);
  };

  //
  const handleChangeHiddle = (value, type) => {
    const obj = {
      ...params
    };
    const val = value ? 1 : 0;
    if (type === 'pnl') {
      obj['hide_zero_realized_pnl'] = val;
      setHiddlePnl(value);
    } else {
      obj['hide_zero_unrealized_pnl'] = val;
      setHiddleUPnl(value);
    }
    console.log(999999, value, type === 'pnl', obj, type);
    getUserOverviewList(obj);
  };

  return (
    <div className={styles.overviewContainer}>
      <div className={styles.filterCard} onClick={openFilterPopup}>
        <span className={styles.filterCard_title}>{t(`${sortName}`)}</span>
        <span className={styles.filterCard_icon} />
      </div>
      <div className={styles.checkWrapper}>
        {/* <Checkbox
          checked={hiddlePnl}
          className={cls(styles.mb16, styles.mr8)}
          onChange={(v) => handleChangeHiddle(v, 'pnl')}
        >
          {t('hidePnl')}
        </Checkbox>
        <Checkbox
          checked={hiddleUPnl}
          className={cls(styles.mb16)}
          onChange={(v) => handleChangeHiddle(v, 'upnl')}
        >
          {t('hideUPnl')}
        </Checkbox> */}
      </div>
      <div className={styles.userOverviewList} id="userOverviewDiv">
        {!loading ? (
          <InfiniteScroll
            dataLength={records.length}
            next={loadMore}
            hasMore={records.length < total}
            loader={<Loading />}
            scrollableTarget="userOverviewDiv"
          >
            <List
              dataSource={records}
              renderItem={(item) => (
                <List.Item key={item} className={styles.listItem}>
                  <RecordInfo
                    value={item}
                    handClickEdit={handClickEdit}
                    goToOpenPosition={goToOpenPosition}
                    goToPlRecord={goToPlRecord}
                  />
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
              onChange={handleChangeFilter}
            >
              {rankFilterList.map((item) => (
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
UserOverviewList = forwardRef(UserOverviewList);

export default UserOverviewList;
