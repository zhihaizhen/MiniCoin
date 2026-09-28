import { Modal, Pagination } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getUserAwardRecords } from '~/api';
import { AwardItem, Record } from '~/interface';
import dayjs from 'dayjs';
import EmptyState from '~/components/EmptyState';
import Loading from '~/components/Loading';
import { basePath } from '~/env';
import ExportedImage from 'next-image-export-optimizer';
import {
  getAwardDesc as getAwardDescUtil,
  getAwardImage as getAwardImageUtil,
  getAwardTokenStr
} from '~/hooks/useAwardInfo';
import { FormattedMessage } from 'react-intl';

interface RedeemDialogProps {
  campaign_no:string;
  open: boolean;
  close: () => void;
}

const RecordsDialog: React.FC<RedeemDialogProps> = ({
  campaign_no,
  open,
  close
}: RedeemDialogProps) => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<Record[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);

  const getRewardRecords = useCallback(() => {
    const params = {
      page_num: pageNum,
      campaign_no,
      page_size: 10
    };
    setLoading(true)
    getUserAwardRecords(params)
      .then((res) => {
        setTableData(res.records || []);
        setTotal(res.total);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageNum, campaign_no]);

  useEffect(() => {
     if (!isLogin || !campaign_no || !open) return;
    getRewardRecords();
  }, [isLogin, getRewardRecords, campaign_no, open]);

  const handleChangePage = (page: number) => {
    setPageNum(page);
  };
  const handleClose = () => {
    setPageNum(1)
    close()
  }

  const getAwardDesc = useCallback((award: Record) => {
    const desc = getAwardDescUtil(award as unknown as AwardItem, t);
    const tokenStr = getAwardTokenStr(award as unknown as AwardItem, t);
    return desc ? `${desc} ${tokenStr}` : tokenStr;
  }, [t]);
  const renderList = () => {
    if (loading) return <Loading />;
    if (tableData.length === 0 && !loading) return (
      <div className="mt-10">
        <EmptyState />
      </div>
    );
    return tableData.map((row, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-between text-sm leading-10 text-text-primary"
              >
                <div className="flex items-center gap-1">
                  <ExportedImage
                    src={`${basePath}/images/gift/${getAwardImageUtil(row)}`}
                    alt="gift"
                    width={24}
                    height={24}
                  />

                  <span className="break-words leading-5">
                     <FormattedMessage
                      id="descformatredforrecords"
                      defaultMessage={getAwardDesc(row)}
                      values={{
                        i: (chunks: React.ReactNode) => <span className="text-text-brand-default-web">{chunks}</span>,
                      }}
                    />
                  </span>
                </div>

                <span className="whitespace-nowrap">
                  {dayjs(row?.claim_dt * 1000).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
            );
          })
  }
  return (
    <Modal
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={460}
      footer={null}
    >
      <div className="relative w-full min-h-[300px]">
        <div className="w-full flex items-center justify-between">
          <div className="text-text-primary text-lg font-semibold">
            {t('reward-records')}
          </div>
          <div className="cursor-pointer" onClick={handleClose}>
            <CloseIcon />
          </div>
        </div>
        <div
          className="flex items-center justify-between text-text-secondary text-sm mt-6 mb-2 leading-8
          border-b border-solid border-line-border-default"
        >
          <span>{t('award')}</span>
          <span> {t('redeem-time')}</span>
        </div>
        {renderList()}
        {total > 10 && (
          <div className="my-pagination mt-4 flex justify-center">
            <Pagination
              size={'small'}
              hideOnSinglePage
              current={pageNum}
              total={total}
              onChange={handleChangePage}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RecordsDialog;
