import { useFm } from "@better-bit-fe/base-hooks";
import React from "react";
import Marquee from "react-fast-marquee";
import { useDepositList } from "~/hooks/apiHooks";
import { basePath } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

const Carousel = () => {
  const t = useFm();
  const { data: depositData = [] } = useDepositList();

  // // 如果没有数据，不显示跑马灯
  // if (!depositData || !Array.isArray(depositData) || depositData.length === 0) {
  //   return null;
  // }

  return (
    <div className={styles.carousel}>
      {/* 交叉背景层 - SVG */}
      <div
        className={styles.backgroundLayer}
        style={{
          backgroundImage: `url(${basePath}/images/carousel-bg.svg)`,
        }}
      />

      {/* 实色绿色背景层 */}
      <div className={styles.greenLayer} />

      {/* 内容层 - 走马灯 */}
      <div className={styles.contentLayer}>
        <Marquee
          speed={50}
          gradient={false}
          pauseOnHover={true}
          direction="left"
          className={styles.marqueeWrapper}
        >
          {Array.isArray(depositData) && depositData.map((notification, index) => (
            <div key={index} className={styles.notificationItem}>
              <img
                src={`${basePath}/images/notice-icon.svg`}
                alt="notice"
                className={styles.noticeIcon}
              />
              <span className={styles.notificationText}>
                {`恭喜用户 ${notification.user_id} ${t('deposit-cashback-carousel-text')} ${notification.amount} USDT`}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default Carousel;
