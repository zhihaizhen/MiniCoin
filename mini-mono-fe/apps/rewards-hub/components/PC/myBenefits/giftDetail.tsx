import React, { useEffect, useState } from 'react';
import { Modal, Table } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { toThousands } from '@unified/helpers';
import { useRouter } from 'next/router';
import { getBalanceRecords } from '~/api';
import { unixToFormat } from '~/utils/day';
import { ReactComponent as NoData } from '~/public/images/PC/noData.svg';
import styles from './giftDetail.module.less';

const GiftDetail = (props) => {
  const t = useFm();
  const { locale } = useRouter();
  const { isShow, handleClose, tokenBalance } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [pager, setPager] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });


  const fetchRecords = (pageNum = pager.pageNum) => {
    setLoading(true);
    getBalanceRecords(
      {
        "award_token": "FreeU",
        "page_num": pageNum,
        "page_size": pager.pageSize
      }).then(res => {
        const { records, total } = res;
        setRecords(records);
        setPager({
          ...pager,
          pageNum,
          total: total
        })
      }).finally(() => {
        setLoading(false);
      })
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    if (isShow) {
      setOpen(true);
    }
  }, [isShow]);

  const handleGoAsset = () => {
    window.open(window.location.origin + '/user/assets')
  }

  const handleCancel = () => {
    setOpen(false);
    handleClose()
  }

  const handleOk = () => {
    setOpen(false);
    handleClose()
  }

  const columns = [
    {
      title: t('columns-time'),
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text) => {
        return unixToFormat(text);
      }
    },
    {
      title: t('columns-from'),
      dataIndex: 'award_source',
      key: 'award_source',
      render: (text) => {
        return text === 'Lottery' ? t('boxDraw') : t('getInActivity');
      }
    },
    // {
    //   title: t('columns-name'),
    //   dataIndex: 'campaign_name', // TODO 后端二期做
    //   key: 'campaign_name',
    //   render: (record) => {
    //     return record.language_config?.[locale].content?.title || '';
    //   }
    // },
    {
      title: t('columns-change'),
      dataIndex: 'award_amount',
      key: 'award_amount',
      render: (text) => {
        return <span className={styles.changeAmount}>{`+${toThousands(text)} FreeU`}</span>;
      }
    },
    {
      title: t('columns-allTotal'),
      dataIndex: 'after_amount',
      key: 'after_amount',
      render: (text) => {
        return <span >{`${toThousands(text)} FreeU`}</span>;
      }
    },
  ];


  return (
    <div >
      <Modal
        rootClassName={styles.benifitModal}
        open={open}
        width={720}
        title={t('freeUByActivitiesTotal')}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <div className={styles.box}>
          <div className={styles.left}>
            <div className={styles.title}>{t('freeUByActivitiesTotal')}</div>
            <div className={styles.num}>{toThousands(tokenBalance)}
              <span className={styles.unit}>FreeU</span>
            </div>
          </div>
          {/* <div className={styles.right}>
            <button onClick={handleGoAsset}>{t('goAsset')}</button>
          </div> */}
        </div>
        <Table
          loading={loading}
          dataSource={records}
          columns={columns}
          pagination={
            {
              total: pager.total,
              pageSize: pager.pageSize,
              current: pager.pageNum,
              onChange: (page, pageSize) => {
                setPager({ ...pager, pageNum: page, pageSize: pageSize })
                fetchRecords(page)
              }
            }
          } />
        {
          records.length === 0 && (
            <div className={styles.noData}>
              <NoData />
              <div className={styles.noDataText}>{t('noData')}</div>
            </div>
          )
        }
      </Modal>
    </div>
  );
};

export default GiftDetail;