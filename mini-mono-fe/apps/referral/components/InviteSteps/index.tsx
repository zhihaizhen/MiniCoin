import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '~/env';
import styles from './index.module.less';

const InviteSteps: React.FC = () => {
  const t = useFm();

  const steps = [
    {
      title: t('step-1-title') || '邀请好友注册',
      desc: t('step-1-desc') || '邀请好友使用您的邀请码或邀请链接注册'
    },
    {
      title: t('step-2-title') || '交易',
      desc: t('step-2-desc') || '受邀好友交易合约或现货'
    },
    {
      title: t('step-3-title') || '反佣',
      desc: t('step-3-desc') || '获得高额返佣到账'
    }
  ];

  return (
    <section className={styles.stepsSection}>
      <div className={styles.titleWrap}>
        <img className={styles.titleDecoLeft} src={`${basePath}/image/left-icon.png`} alt="" aria-hidden="true" />
        <h2 className={styles.sectionTitle}>{t('invite-steps') || '邀请步骤'}</h2>
        <img className={styles.titleDecoRight} src={`${basePath}/image/icon-right.png`} alt="" aria-hidden="true" />
      </div>
      <div className={styles.stepsCard}>
        <div className={styles.stepsLine} aria-hidden="true" />
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className={styles.stepItem}>
              <div className={styles.stepBadge}>{idx + 1}</div>
              <span className={styles.stepTitle}>{step.title}</span>
              <span className={styles.stepDesc}>{step.desc}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={styles.stepConnector} aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default InviteSteps;
