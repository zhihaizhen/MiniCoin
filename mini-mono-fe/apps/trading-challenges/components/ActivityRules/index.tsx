import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface ItemProps {
  index?: number;
  title?: string;
  content?: string;
}

const RuleItem: React.FC<ItemProps> = ({ index, title, content }) => {
  return (
    <div className={styles.ruleItem}>
      <div className={styles.ruleIndex}>{index}</div>
      <div className={styles.ruleContent}>
        {title && <span className={styles.ruleTitle}>{title}</span>}
        {content}
      </div>
    </div>
  );
};

const RuleSubItem: React.FC<ItemProps> = ({ content }) => {
  return (
    <div className={styles.subRuleItem}>
      <div className={styles.ruleIndex}>0</div>
      <span>{content}</span>
    </div>
  );
};

const ActivityRules = () => {
  const t = useFm();

  const ruleItems = [
    { index: 1, key: 'activity-rules-item1-content' },
    { index: 2, key: 'activity-rules-item2-content' },
    { index: 3, key: 'activity-rules-item3-content' },
    { index: 4, key: 'activity-rules-item4-content' },
    { index: 5, key: 'activity-rules-item5-content' },
    { index: 6, key: 'activity-rules-item6-content' },
  ];

  return (
    <div className={styles.activityRules}>
      <h1 className={styles.title}>{t('activity-rules-title')}</h1>
      <div className={styles.rulesList}>
        {ruleItems.map((item) => (
          <RuleItem
            key={item.index}
            index={item.index}
            content={t(item.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityRules;
