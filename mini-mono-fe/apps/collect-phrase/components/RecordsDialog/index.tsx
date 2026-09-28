import { Modal, Pagination } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { ReactComponent as CloseIcon } from '~/public/images/closeSim.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getUserAwardRecords } from '~/api';
import { Record } from '~/interface';
import dayjs from 'dayjs';
import { AwardType } from '~/enums';
import EmptyState from '~/components/EmptyState';
import Loading from '~/components/Loading';
import { basePath } from '~/env';
import ExportedImage from 'next-image-export-optimizer';

interface RedeemDialogProps {
  open: boolean;
  close: () => void;
}

const PHYSICAL_AWARD_IMAGE_MAP = {
  RedeemGold: 'RedeemGold.png',
  RedeemKnapsack: 'bag.png',
  RedeemItems: 'box.png'
};

const RecordsDialog: React.FC<RedeemDialogProps> = ({
  open,
  close
}: RedeemDialogProps) => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<Record[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);

  const getAwardImage = (award?: Record) => {
    if (award?.award_type === AwardType.PhysicalAward) {
      return PHYSICAL_AWARD_IMAGE_MAP[award.award_item_type] || 'ServiceCash.png';
    }
    const typeMap = {
      [AwardType.ServiceCash]: 'ServiceCash.png',
      [AwardType.RealCash]: 'RealCash.png',
      [AwardType.PreGivenCash]: 'PostGivenCash.png',
      [AwardType.PostGivenCash]: 'PostGivenCash.png'
    };
    return (
      (award?.award_type && typeMap[award.award_type]) || 'ServiceCash.png'
    );
  };

  const getRewardRecords = useCallback(() => {
    const params = {
      page_num: pageNum,
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
  }, [pageNum]);

  useEffect(() => {
     if (!isLogin || !open) return;
    getRewardRecords();
  }, [isLogin, getRewardRecords, open]);

  const handleChangePage = (page: number) => {
    setPageNum(page);
  };
  const handleClose = () => {
    setPageNum(1)
    close()
  }

  const getAwardDesc = (award) => {
    if (award.award_type === AwardType.PhysicalAward) {
      if (award.award_item_type === 'RedeemGold') {
        return t('redeemRewards.redeemGold');
      }
      return t('redeemRewards.default');
    }
    const descMap = {
      [AwardType.ServiceCash]: 'redeemRewards.serviceCash',
      [AwardType.RealCash]: 'redeemRewards.realCash',
      [AwardType.PreGivenCash]: 'redeemRewards.postGivenCash',
      [AwardType.PostGivenCash]: 'redeemRewards.postGivenCash'
    };
    const key = descMap[award.award_type as AwardType];
    return key ? `${award.award_amount} ${award.award_token} ${t(key)}`  : '';
  };
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
              src={`${basePath}/images/gold.svg`}
              alt=" "
              width={24}
              height={24}
            />
            <span className="truncate">{getAwardDesc(row)}</span>
          </div>

          <span className="truncate">
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
      width={440}
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
