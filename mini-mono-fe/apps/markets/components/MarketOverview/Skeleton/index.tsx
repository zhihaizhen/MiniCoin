import React from 'react';
import cls from 'classnames';
import styles from './index.module.less';

const CARD_COUNT = 4;
const RANK_BOARD_COUNT = 2;
const RANK_COL_COUNT = 2;
const RANK_ROW_COUNT = 3;

const MarketOverviewSkeleton = () => {
  return (
    <>
      <div className={styles.cardRow}>
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <div key={index} className={styles.cardSkeleton}>
            <div className={styles.cardSkeletonTop}>
              <span className={styles.skeletonCircle} />
              <span className={cls(styles.skeletonLine, styles.w80)} />
              <span className={cls(styles.skeletonLine, styles.w48, styles.mlAuto)} />
            </div>
            <div className={styles.cardSkeletonBottom}>
              <span className={cls(styles.skeletonLine, styles.w100, styles.h28)} />
              <span className={styles.skeletonChart} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.rankRow}>
        {Array.from({ length: RANK_BOARD_COUNT }).map((_, board) => (
          <div key={board} className={styles.rankSkeleton}>
            <span className={cls(styles.skeletonLine, styles.w64, styles.h20)} />
            <div className={styles.rankSkeletonCols}>
              {Array.from({ length: RANK_COL_COUNT }).map((_, col) => (
                <div key={col} className={styles.rankSkeletonCol}>
                  {Array.from({ length: RANK_ROW_COUNT }).map((_, row) => (
                    <div key={row} className={styles.rankSkeletonRow}>
                      <span className={styles.skeletonCircleSm} />
                      <span className={cls(styles.skeletonLine, styles.w64)} />
                      <span className={cls(styles.skeletonLine, styles.w56, styles.mlAuto)} />
                      <span className={cls(styles.skeletonLine, styles.w48)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MarketOverviewSkeleton;
