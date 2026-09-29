import React, { useEffect, useState, useRef, memo } from 'react';
import { Pagination } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import { getUserPositionRecord } from '~/api';
import EmptyState from '~/components/common/EmptyState';
import Loading from '~/components/common/Loading';
import { formatTimestamp } from '~/utils';
import ExportedImage from 'next-image-export-optimizer';

// 定义数据接口
interface PositionRecord {
  symbol: string;
  side: string;
  margin_mode: string;
  cur_pz_leverage: string | number;
  close_pz_time: string | number;
  [key: string]: any;
}

// 定义组件 Props 接口
interface PositionTableProps {
  luckNoticeNum: number;
  campaignNo: string;
  updateLuckyNum: (num: number) => void;
  isBlock?: boolean;
}

const PositionTable: React.FC<PositionTableProps> = ({ luckNoticeNum, campaignNo, updateLuckyNum, isBlock }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<PositionRecord[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);

  const updateLuckyNumRef = useRef(updateLuckyNum);
  useEffect(() => {
    updateLuckyNumRef.current = updateLuckyNum;
  }, [updateLuckyNum]);

  // 数据获取逻辑
  useEffect(() => {
    // 未登录状态下，清空数据并停止 loading
    if (!isLogin) {
      setTableData([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const fetchPositionRecords = async () => {
      setLoading(true);
      try {
        const pages = {
          campaign_no: campaignNo,
          page_num: pageNum,
          page_size: 10,
        };
        const res = await getUserPositionRecord(pages);
        setTableData(res.records || []);
        setTotal(res.total);
        // 更新父组件计数，使用 ref 调用避免依赖循环
        updateLuckyNumRef.current?.(res.total);
      } catch (error) {
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPositionRecords();
  }, [isLogin, pageNum, luckNoticeNum, campaignNo]);

  const handleChangePage = (page: number) => {
    setPageNum(page);
  };

  const toTrade = () => {
    if (isBlock) {
      goPage('blockTrade');
    } else {
      goPage('trade');
    }
  };

  return (
    <div className="relative w-full md:w-auto md:min-w-[960px]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-[20px]">
          <Loading />
        </div>
      )}
      {tableData.length <= 0 && !loading ? (
        <EmptyState title={t('no-lucky-orders')} isBlock={isBlock} />
      ) : (
        <div className="w-full flex flex-col items-center justify-start border border-white/20 rounded-[20px] p-4 md:p-6">
          <div className="w-full h-12 flex items-center justify-between">
            <div className="flex justify-start items-center gap-2">
              <ExportedImage
                src={`${basePath}/images/gift.png`}
                alt="gift"
                width={24}
                height={24}
              />
              <span className="text-sm md:text-base font-normal"> {t('lucky-orders')} </span>
              <span className="text-sm md:text-base text-text-brand-default font-semibold"> {total} </span>
            </div>
            <div
              className="min-w-[108px] md:min-w-[136px] h-8 px-2 md:h-10 flex justify-center items-center text-black text-sm md:text-base font-semibold rounded-full border border-[#96C031] bg-fill-button-green-default shadow-[0_1px_16px_6px_rgba(142,184,39,0.3)] cursor-pointer hover:opacity-90"
              onClick={toTrade}
            >
              {isBlock ? t('go-block-trade'): t('go-trade')}
            </div>
          </div>
          <div className="w-full h-10 hidden md:flex items-center justify-between border-b border-b-[#1D1D1D] mt-6 md:mt-10">
            <span className="text-sm text-text-secondary"> {t('contract-order')} </span>
            <span className="text-sm text-text-secondary"> {t('over-time')} </span>
          </div>
          {tableData.map((row, index) => {
            return (
              <div key={index + row.symbol} className="w-full">
                <div className="w-full h-14 hidden md:flex flex-row justify-between items-center gap-2">
                  <div className="flex items-center justify-start gap-2">
                    <span className="text-base font-semibold text-white"> {row.symbol} </span>
                    <div className="m-w-10 h-6 rounded-full text-xs font-medium px-3 py-1 text-text-green bg-fill-tag-green">
                      {row.side === 'Buy' ? t('buy') : t('sell')}
                    </div>
                    <div className={`m-w-10 h-6 rounded-full text-xs font-medium px-3 py-1 text-text-green bg-fill-tag-green ${isBlock ? 'hidden' : ''}`}>
                      {t(row.margin_mode)} {+row.cur_pz_leverage} X
                    </div>
                  </div>
                  <div className="text-sm text-white font-normal"> {formatTimestamp(Number(row.close_pz_time))}</div>
                </div>
                <div className="w-full h-[90px] md:hidden flex flex-col justify-between items-start gap-2 p-4 bg-bg-secondary rounded-[8px] mt-4">
                  <div className="flex items-center justify-start gap-2">
                    <span className="text-[16px] font-semibold text-white"> {row.symbol} </span>
                    <div className="m-w-10 h-6 rounded-full text-xs font-medium px-3 py-1 text-text-green bg-fill-tag-green">
                      {row.side === 'Buy' ? t('buy') : t('sell')}
                    </div>
                    <div className={`m-w-10 h-6 rounded-full text-xs font-medium px-3 py-1 text-text-green bg-fill-tag-green ${isBlock ? 'hidden' : ''}`}>
                      {t(row.margin_mode)} {+row.cur_pz_leverage} X
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div className="text-xs text-text-secondary"> {t('over-time')} </div>
                    <div className="text-xs text-white font-normal"> {formatTimestamp(Number(row.close_pz_time))}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="my-pagination mt-8">
            <Pagination
              hideOnSinglePage
              current={pageNum}
              total={total}
              showSizeChanger={false}
              onChange={handleChangePage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionTable;
