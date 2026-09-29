import React, { useCallback, useEffect, useState, memo } from 'react';
import { basePath, getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import { formatTimestamp } from '~/utils';
import { Pagination } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import EmptyState from '~/components/common/EmptyState';
import { ReactComponent as RightIcon } from '~/public/images/right-arrow.svg';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getUserLotterRecord } from '~/api';
import Loading from '~/components/common/Loading';
import ExportedImage from 'next-image-export-optimizer';
import { LotteryRecord } from '~/interface';

interface HistoryTableProps {
  campaignNo: string;
  luckNoticeNum?: number;
  isBlock?: boolean;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ campaignNo, luckNoticeNum, isBlock }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<LotteryRecord[]>([])
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);

  const getLuckySummery = useCallback(() => {
    const params = {
      page_num: pageNum,
      campaign_no: campaignNo,
      page_size: 10
    }
    setLoading(true)
    getUserLotterRecord(params).then((res) => {
      setTableData(res.records || []);
      setTotal(res.total);
    }).finally(() => { setLoading(false) });
  }, [pageNum, campaignNo])

  useEffect(() => {
    if (isLogin === false) {
      setLoading(false);
      return;
    }
    getLuckySummery();
  }, [isLogin, getLuckySummery, luckNoticeNum]);

  const handleChangePage = (page: number) => {
    setPageNum(page);
  };

  const toTrade = () => {
    if (isBlock) {
      goPage("blockTrade")
    } else {
      goPage("trade")
    }
  }
  const onAssetsHistory = () => {
    goPage("assetsHistory", "tab=3")
  }

  return (
    <div className="relative w-full md:w-auto md:min-w-[960px]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-[20px]">
          <Loading />
        </div>
      )}
      {tableData.length <= 0 && !loading ? <EmptyState title={t('no-lucky-history')} isBlock={isBlock} /> :
        <div className="w-full flex flex-col items-center justify-start border border-white/20 rounded-[20px] p-4 md:p-6">
          <div className="w-full h-12 flex items-center justify-between">
            <div className="w-full md:w-auto flex justify-between md:justify-start items-center gap-2">
              <div className="flex items-center justify-start gap-2">
                <ExportedImage
                  src={`${basePath}/images/gift.png`}
                  alt="gift"
                  width={24}
                  height={24}
                />
                <span className="text-sm md:text-base font-normal"> {t('lucky-summary-num')} </span>
                <span className="text-sm md:text-base font-semibold"> {total} </span>
              </div>
              <div className="text-sm font-medium text-text-brand-default flex justify-start items-center cursor-pointer" onClick={onAssetsHistory}> <span>{t('view-wallet-record')}</span>  <RightIcon /> </div>
            </div>
            <div className="min-w-[108px] md:min-w-[136px] h-8 md:h-10 hidden md:flex justify-center items-center text-black text-sm md:text-base font-semibold
            rounded-full border border-[#96C031] bg-fill-button-green-default shadow-[0_1px_16px_6px_rgba(142,184,39,0.3)] cursor-pointer hover:opacity-90 px-4"
              onClick={toTrade}
            >
               {isBlock ? t('go-block-trade'): t('go-trade')}
            </div>
          </div>
          <div className="w-full h-10 hidden md:flex items-center justify-between border-b border-b-[#1D1D1D] mt-6 md:mt-10">
            <span className="flex-1 text-sm text-text-secondary"> {t('reward')} </span>
            <span className="flex-1 text-sm text-text-secondary"> {t('amount')} </span>
            <span className="flex-1 text-sm text-text-secondary"> {t('start-lucky-time')} </span>
            <span className="flex-1 text-sm text-right text-text-secondary"> {t('state')} </span>
          </div>
          {tableData.map((row, index) => {
            const uniqueKey = row.id ? String(row.id) : `${index}-${row.award_token}`;
            return (
              <div key={uniqueKey} className="w-full">
                <div className="w-full h-14 hidden md:flex justify-between items-center gap-2 " >
                  <div className="flex-1 flex items-center justify-start gap-1">
                    <div className="w-10 flex justify-center items-center">
                      {
                        row.award_type === 'VirtualCurrency' ?
                          <ExportedImage
                            className="rounded-full"
                            src={getSymbolUrl(row.award_token.toLowerCase())}
                            alt=" "
                            width={24}
                            height={24}
                          /> :
                          <ExportedImage
                            src={`${basePath}/images/${row.award_type === 'Coupons' ?  `${row.coupon_type || 'PostGivenCash'}.png` : 'card.svg'}`}
                            alt={row.award_token}
                            width={40}
                            height={40}
                          />
                      }
                    </div>
                    <span className="text-base font-normal text-white"> {row.award_type === 'VirtualCurrency' ? row.award_token : row.award_type === 'Coupons' ? t(`${row.product_type || 'Coupons'}${row.coupon_type}`) : `${row.award_ratio}% ${t('lucky-card')}`} </span>
                  </div>
                  <div className="flex-1 text-sm text-text-green font-normal">+ {`${+row.award_amount} ${row.award_token}`}</div>
                  <div className="flex-1 text-sm text-white font-normal"> {formatTimestamp(Number(row.claim_dt))}</div>
                  <div className="flex-1 text-sm text-right text-white font-normal"> {t(row.claim_status)}</div>
                </div>
                <div className="w-full h-[147px] flex md:hidden flex-col justify-start items-start gap-2 p-4 bg-bg-secondary rounded-[8px] mt-4">
                  <div className="flex items-center justify-start gap-3">
                    <div className="w-[35px] flex justify-center items-center">
                      {
                        row.award_type === 'VirtualCurrency' ?
                          <ExportedImage
                            src={getSymbolUrl(row.award_token.toLowerCase())}
                            alt=" "
                            width={34}
                            height={34}
                          /> :
                          <ExportedImage
                            src={`${basePath}/images/${row.award_type === 'Coupons' ? `${row.coupon_type || 'PostGivenCash'}.png` : 'card.svg'}`}
                            alt={row.award_token}
                            width={40}
                            height={28}
                          />
                      }
                    </div>
                    <span className="text-base font-normal text-white">  {row.award_type === 'VirtualCurrency' ? row.award_token : row.award_type === 'Coupons' ? t(`${row.product_type || 'Coupons'}${row.coupon_type}`) : `${row.award_ratio}% ${t('lucky-card')}`} </span>
                  </div>
                  <div className="w-full flex justify-between items-center mt-2">
                    <span className="text-xs text-text-secondary"> {t('amount')} </span>
                    <span className="text-sm text-text-green font-semibold"> {`${+row.award_amount} ${row.award_token}`}</span>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs text-text-secondary"> {t('start-lucky-time')} </span>
                    <div className="text-xs text-white font-normal"> {formatTimestamp(Number(row.claim_dt))}</div>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs text-text-secondary"> {t('state')} </span>
                    <div className="text-xs text-white font-normal"> {t(row.claim_status)}</div>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="my-pagination mt-8">
            <Pagination
              hideOnSinglePage
              current={pageNum}
              total={total}
              onChange={handleChangePage}
              showSizeChanger={false}
            />
          </div>
        </div>
      }
    </div>
  )
}
export default HistoryTable;
