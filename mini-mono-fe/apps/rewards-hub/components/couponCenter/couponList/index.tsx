import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { Pagination } from 'antd';
import { ReactComponent as IconTime } from '~/public/images/coupon/time.svg';
import { ReactComponent as IconGuide } from '~/public/images/coupon/guide.svg';
import { CouponTabType } from '../couponTabs';
import ActivateModal from '../activateModal';
import ActivateSuccessModal from '../activateSuccessModal';
import { claimCoupon, getCouponList, getCouponStatusCount } from '~/api';
import dayjs from '~/utils/day';
import styles from './index.module.less';

interface CouponListProps {
  activeTab: CouponTabType;
  isLogin: boolean;
  onCountsChange?: (counts: Record<string, number>) => void;
  onViewUsed?: () => void;
}

interface CouponItem {
  id: string;
  amount: number;
  currency: string;
  couponType: string;
  rawCouponType: string;
  expireTime: string;
  condition?: string;
  minTokenLimit?: number;
  status: CouponTabType;
  actionType: 'activate' | 'exchange';
}

const PAGE_SIZE = 8;

const TAB_STATUS_MAP: Record<CouponTabType, string> = {
  [CouponTabType.PENDING]: 'Init',
  [CouponTabType.USED]: 'Activated',
  [CouponTabType.EXPIRED]: 'Reclaimed'
};

const COUPON_STATUS_MAP: Record<string, CouponTabType> = {
  Init: CouponTabType.PENDING,
  Activated: CouponTabType.USED,
  Reclaimed: CouponTabType.EXPIRED
};

const getCouponTypeMap = (t: (key: string) => string): Record<string, string> => ({
  PostGivenCash: t('future-trial-cash'),
  ServiceCash: t('service-cash'),
  PreGivenCash: t('future-trial-cash')
});

const CouponSkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonBadge} />
    <div className={styles.skeletonTop}>
      <div className={styles.skeletonFace} />
      <div className={styles.skeletonInfo}>
        <div className={styles.skeletonLine} style={{ width: '60%', height: 22 }} />
        <div className={styles.skeletonLine} style={{ width: '80%', height: 16 }} />
        <div className={styles.skeletonLine} style={{ width: '70%', height: 16 }} />
      </div>
    </div>
    <div className={styles.skeletonDivider} />
    <div className={styles.skeletonBtn} />
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapApiItem = (item: any, t: (key: string, values?: Record<string, string | number>) => string): CouponItem => ({
  id: item.id,
  amount: Number(item.coupon_amount),
  currency: item.token,
  couponType: getCouponTypeMap(t)[item.coupon_type] ?? item.coupon_type,
  rawCouponType: item.coupon_type,
  expireTime: dayjs(Number(item.end_at)).format('YYYY-MM-DD HH:mm:ss'),
  condition: ['PostGivenCash', 'PreGivenCash'].includes(item.coupon_type) && item.min_token_limit
    ? t('couponContractCondition', { minLimit: item.min_token_limit, token: item.token })
    : undefined,
  minTokenLimit: item.min_token_limit ? Number(item.min_token_limit) : undefined,
  status: COUPON_STATUS_MAP[item.coupon_status] ?? CouponTabType.PENDING,
  actionType: 'activate'
});

const CouponList = ({ activeTab, isLogin, onCountsChange, onViewUsed }: CouponListProps) => {
  const t = useFm();
  const [list, setList] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [activateItem, setActivateItem] = useState<CouponItem | null>(null);
  const [activateLoading, setActivateLoading] = useState(false);
  const [successItem, setSuccessItem] = useState<CouponItem | null>(null);
  // 标记 fetchCounts 是否已返回，用于判断是否需要列表 total 兜底
  const countsSettledRef = useRef(false);

  const fetchCounts = useCallback(async () => {
    if (!isLogin) return;
    countsSettledRef.current = false;
    try {
      const res = await getCouponStatusCount();
      countsSettledRef.current = true;
      onCountsChange?.({
        [CouponTabType.PENDING]: res?.init_count ?? 0,
        [CouponTabType.USED]: res?.activated_count ?? 0,
        [CouponTabType.EXPIRED]: res?.expired_count ?? 0
      });
    } catch {
      countsSettledRef.current = true;
    }
  }, [isLogin, onCountsChange]);

  const fetchList = useCallback(async (page = 1) => {
    if (!isLogin) return;
    setLoading(true);
    try {
      const res = await getCouponList({
        page_num: page,
        page_size: PAGE_SIZE,
        coupon_status: TAB_STATUS_MAP[activeTab],
        product_type: 'Contract'
      });
      const records = res?.records ?? [];
      const listTotal = res?.total ?? 0;
      setList(records.map((item) => mapApiItem(item, t)));
      setTotal(listTotal);
      // 列表比 fetchCounts 先返回时，用当前 tab 的 total 先更新 counts 兜底
      if (!countsSettledRef.current) {
        onCountsChange?.({ [activeTab]: listTotal });
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [activeTab, isLogin, onCountsChange, t]);

  useEffect(() => {
    setPageNum(1);
    fetchList(1);
  }, [activeTab, isLogin]);

  useEffect(() => {
    fetchCounts();
  }, [isLogin]);

  const handlePageChange = (page: number) => {
    setPageNum(page);
    fetchList(page);
  };

  const handleAction = (item: CouponItem) => {
    if (item.actionType === 'activate') {
      setActivateItem(item);
    }
    // exchange 类型跳转逻辑待产品确认
  };

  const handleActivateConfirm = async () => {
    if (!activateItem) return;
    setActivateLoading(true);
    try {
      await claimCoupon({ coupon_id: activateItem.id });
      setActivateItem(null);
      setSuccessItem(activateItem);
      fetchList(1);
      fetchCounts();
    } catch { /* ignore */ } finally {
      setActivateLoading(false);
    }
  };

  if (!isLogin) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyText}>{t('loginOrSign')}</div>
      </div>
    );
  }

  return (
    <div className={styles.couponList}>
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <CouponSkeletonCard key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className={styles.emptyWrap}>
          <img src={`${process.env.BASE_PATH ?? ''}/images/coupon/empty.png`} alt="empty" className={styles.emptyImg} />
          <p className={styles.emptyText}>{t('noCoupon')}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {list.map((item) => (
            <div key={item.id} className={styles.couponCard}>
              {activeTab !== CouponTabType.EXPIRED && (
                <span className={`${styles.cardBadge} ${activeTab === CouponTabType.USED ? styles.cardBadgeUsed : ''}`}>
                  {activeTab === CouponTabType.PENDING ? t('pendingActivate') : t('activated')}
                </span>
              )}
              {/* H5 金额行（PC 隐藏） */}
              <div className={styles.h5Amount}>
                <span className={styles.h5AmountNum}>{item.amount}</span>
                <span className={styles.h5AmountUnit}>{item.currency}</span>
              </div>
              {/* 顶部：券面 + 信息 */}
              <div className={styles.cardTop}>
                {/* 左侧券面（PC） */}
                <div className={styles.couponFace}>
                  <div className={styles.couponFaceAmount}>
                    <span className={styles.couponFaceNum}>{item.amount}</span>
                    <span className={styles.couponFaceUnit}>{item.currency}</span>
                  </div>
                  <div className={styles.couponFaceType}>{item.couponType}</div>
                </div>
                {/* 信息 */}
                <div className={styles.cardInfo}>
                  <div className={styles.cardTitle}>{item.couponType}</div>
                  <div className={styles.cardMeta}>
                    <IconTime className={styles.cardMetaIcon} />
                    <span className={styles.cardMetaText}>{t('expireTime')}：{item.expireTime}</span>
                  </div>
                  {item.condition && (
                    <div className={styles.cardMeta}>
                      <IconGuide className={styles.cardMetaIcon} />
                      <span className={styles.cardMetaText}>{item.condition}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* 底部：折扣比例 + 操作按钮 */}
              <div className={styles.cardBottom}>
                <div className={styles.cardDivider} />
                <div className={styles.cardFooter}>
                  {activeTab === CouponTabType.PENDING ? (
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleAction(item)}
                    >
                      {t('goActivate')}
                    </button>
                  ) : (
                    <button className={`${styles.actionBtn} ${styles.actionBtnDisabled}`} disabled>
                      {activeTab === CouponTabType.USED ? t('used') : t('expired')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && total > PAGE_SIZE && (
        <div className={styles.paginationWrapper}>
          <Pagination
            current={pageNum}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={handlePageChange}
            showSizeChanger={false}
            className={styles.pagination}
          />
        </div>
      )}

      <ActivateModal
        open={!!activateItem}
        couponType={activateItem?.couponType ?? ''}
        rawCouponType={activateItem?.rawCouponType ?? ''}
        minTokenLimit={activateItem?.minTokenLimit}
        token={activateItem?.currency}
        loading={activateLoading}
        onCancel={() => setActivateItem(null)}
        onConfirm={handleActivateConfirm}
      />

      <ActivateSuccessModal
        open={!!successItem}
        amount={successItem?.amount ?? 0}
        currency={successItem?.currency ?? ''}
        couponType={successItem?.couponType ?? ''}
        onClose={() => setSuccessItem(null)}
        onViewUsed={() => {
          setSuccessItem(null);
          onViewUsed?.();
        }}
      />
    </div>
  );
};

export default CouponList;
