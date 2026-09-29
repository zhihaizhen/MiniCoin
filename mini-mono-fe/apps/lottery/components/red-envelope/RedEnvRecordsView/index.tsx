import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getBonusLotteryRecord } from '~/api';
import { formatTimestamp } from '~/utils';
import Loading from '~/components/common/Loading';
import EmptyState from '~/components/common/EmptyState';
import { basePath, getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import { Pagination } from 'antd';
import { ReactComponent as RightIcon } from '~/public/images/right-arrow.svg';
import ExportedImage from 'next-image-export-optimizer';
import { RedEnvRecord } from '~/interface';

interface Props {
  campaignNo: string;
}

export interface RedEnvRecordsViewRef {
  update: () => void;
}

interface BonusLotteryRecordResponse {
  records?: RedEnvRecord[];
  total: number;
}

const RedEnvRecordsView = forwardRef<RedEnvRecordsViewRef, Props>(
  ({ campaignNo }, ref) => {
    const t = useFm();
    const { isLogin } = useUserInfo();

    const [loading, setLoading] = useState<boolean>(true);
    const [tableData, setTableData] = useState<RedEnvRecord[]>([]);
    const [pageNum, setPageNum] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    const getRecord = useCallback(async () => {
      if (!campaignNo) {
        // 没有活动编号时不请求，直接清空
        setTableData([]);
        setTotal(0);
        setPageNum(1);
        setLoading(false);
        return;
      }

      const params = {
        page_num: pageNum,
        campaign_no: campaignNo,
        page_size: 10
      };

      setLoading(true);
      try {
        const res: BonusLotteryRecordResponse = await getBonusLotteryRecord(params);
        setTableData(res.records ?? []);
        setTotal(res.total ?? 0);
      } catch (e) {
        console.error('Failed to fetch bonus lottery record', e);
        setTableData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, [pageNum, campaignNo]);

    const handleChangePage = (page: number) => {
      setPageNum(page);
    };

    useEffect(() => {
      if (!isLogin) {
        // 未登录时不请求，并重置状态
        setTableData([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      void getRecord();
    }, [isLogin, getRecord]);

    const onAssetsHistory = () => {
      goPage('assetsHistory', 'tab=3');
    };

    useImperativeHandle(
      ref,
      () => ({
        update: getRecord
      }),
      [getRecord]
    );

    if (isLogin && loading) {
      return (
        <div className="w-full min-h-[462px] md:w-auto md:min-w-[960px] flex items-center justify-center border border-[#28292A] rounded-[20px] p-6">
          <Loading isBlue={true} />
        </div>
      );
    }

    return (
      <div className="w-full md:w-[960px] flex flex-col justify-center items-center gap-10 mt-[52px] md:mt-0 px-4 md:px-0">
        <div className="w-full flex justify-center md:justify-between items-center gap-[50px]">
          <div className="hidden md:block flex-1 h-0.5 bg-[linear-gradient(270deg,#ABE127_0%,rgba(171,225,39,0)_85.67%)]" />
          <h2 className="text-xl md:text-[32px] font-bold text-white">
            {t('get-records')}
          </h2>
          <div className="hidden md:block flex-1 h-0.5 bg-[linear-gradient(90deg,#ABE127_0%,rgba(171,225,39,0)_85.67%)]" />
        </div>

        <div className="w-full flex flex-col items-center justify-start border border-[#28292A] rounded-[20px] p-4 md:p-6">
          {total > 0 && (
            <div className="w-full h-12 flex items-center justify-between">
              <div className="w-full flex justify-start items-center gap-2">
                <ExportedImage
                  src={`${basePath}/images/envIcon.png`}
                  alt="gift"
                  width={24}
                  height={24}
                />
                <span className="text-sm md:text-base font-normal text-white">
                  {t('claim-summary-num')}
                </span>
                <span className="text-sm md:text-base font-semibold text-white">
                  {total}
                </span>
              </div>
              <div
                className="text-sm font-medium text-[#ABE127] flex justify-start items-center cursor-pointer"
                onClick={onAssetsHistory}
              >
                <span className="text-nowrap">{t('view-wallet-record')}</span>
                <RightIcon />
              </div>
            </div>
          )}

          <div className="w-full h-10 hidden md:flex items-center justify-between border-b border-b-[#1D1D1D]">
            <span className="flex-1 text-sm text-text-secondary">
              {t('collect-items')}
            </span>
            <span className="flex-1 text-sm text-text-secondary">
              {t('amount')}
            </span>
            <span className="flex-1 text-sm text-text-secondary">
              {t('start-lucky-time')}
            </span>
            <span className="flex-1 text-sm text-right text-text-secondary">
              {t('state')}
            </span>
          </div>

          {tableData.length === 0 ? (
            <EmptyState title={t('no-get-history')} type="red" />
          ) : (
            <>
              {tableData.map((row, index) => {
                const uniqueKey =`${index}-${row.award_token}`;
                const token = row.award_token ?? '';
                const amount = Number(row.award_amount);
                const claimTime = Number(row.claim_dt);

                return (
                  <div key={uniqueKey} className="w-full">
                    <div className="w-full h-14 hidden md:flex justify-between items-center gap-2">
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
                                className="rounded-full"
                                src={`${basePath}/images/${row.award_type === 'Coupons' ?  `${row.coupon_type || 'PostGivenCash'}.png` : 'card.svg'}`}
                                alt={row.award_token}
                                width={28}
                                height={28}
                              />
                          }
                        </div>
                        <span className="text-sm font-normal text-white"> {row.award_type === 'VirtualCurrency' ? row.award_token : row.award_type === 'Coupons' ? t(`${row.product_type || 'Coupons'}${row.coupon_type}`) : `${row.award_ratio}% ${t('lucky-card')}`} </span>
                      </div>
                      <div className="flex-1 text-sm text-[#ABE127] font-normal">
                        + {`${amount} ${token}`}
                      </div>
                      <div className="flex-1 text-sm text-white font-normal">
                        {formatTimestamp(claimTime)}
                      </div>
                      <div className="flex-1 text-sm text-right text-white font-normal">
                        {t(row.claim_status)}
                      </div>
                    </div>

                    {/* 移动端卡片样式 */}
                    <div className="w-full h-[147px] flex md:hidden flex-col justify-start items-start gap-2 p-4 bg-bg-secondary rounded-[8px] mt-4">
                      <div className="flex items-center justify-start gap-3">
                        <div className="w-[35px] flex justify-center items-center">
                          {
                            row.award_type === 'VirtualCurrency' ?
                              <ExportedImage
                                className="rounded-full"
                                src={getSymbolUrl(row.award_token.toLowerCase())}
                                alt=" "
                                width={28}
                                height={28}
                              /> :
                              <ExportedImage
                                className="rounded-full"
                                src={`${basePath}/images/${row.award_type === 'Coupons' ? `${row.coupon_type || 'PostGivenCash'}.png` : 'card.svg'}`}
                                alt={row.award_token}
                                width={40}
                                height={40}
                              />
                          }
                        </div>
                        <span className="text-sm font-normal text-white">  {row.award_type === 'VirtualCurrency' ? row.award_token : row.award_type === 'Coupons' ? t(`${row.product_type || 'Coupons'}${row.coupon_type}`) : `${row.award_ratio}% ${t('lucky-card')}`} </span>
                      </div>
                      <div className="w-full flex justify-between items-center mt-2">
                        <span className="text-xs text-text-secondary">
                          {t('amount')}
                        </span>
                        <span className="text-sm text-[#ABE127] font-semibold">
                          {`${amount} ${token}`}
                        </span>
                      </div>
                      <div className="w-full flex justify-between items-center">
                        <span className="text-xs text-text-secondary">
                          {t('start-lucky-time')}
                        </span>
                        <div className="text-xs text-white font-normal">
                          {formatTimestamp(claimTime)}
                        </div>
                      </div>
                      <div className="w-full flex justify-between items-center">
                        <span className="text-xs text-text-secondary">
                          {t('state')}
                        </span>
                        <div className="text-xs text-white font-normal">
                          {t(row.claim_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="my-red-pagination mt-8">
                <Pagination
                  hideOnSinglePage
                  current={pageNum}
                  total={total}
                  onChange={handleChangePage}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

RedEnvRecordsView.displayName = 'RedEnvRecordsView';

export default RedEnvRecordsView;
