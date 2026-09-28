import React from 'react';
import dayjs from 'dayjs';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import type { PasskeyListItem } from '~/types/passkey';
import { getCurrentPasskeyCredentialId } from '~/utils/passkey/deviceId';
import { ReactComponent as IconPasskey } from '~/public/images/passkey/passkey-entry.svg';
import styles from './index.module.less';

interface PasskeyListProps {
  list: PasskeyListItem[];
  onRename: (item: PasskeyListItem) => void;
  onDelete: (item: PasskeyListItem) => void;
}

function formatCreateTime(ts: number): string {
  if (!ts) return '--';
  return dayjs(ts * 1000).format('YYYY-MM-DD  HH:mm');
}

function getTag(item: PasskeyListItem, t: (id: string) => string): string | null {
  const transports = item.transports || [];
  if (transports.includes('hybrid')) {
    return t('passkey-tag-cross-device');
  }
  const currentId = getCurrentPasskeyCredentialId();
  if (currentId && item.credential_id && currentId === item.credential_id) {
    return t('passkey-tag-current-device');
  }
  return null;
}

const PasskeyList: React.FC<PasskeyListProps> = ({ list, onRename, onDelete }) => {
  const t = useFm();

  return (
    <div className={styles.list}>
      {list.map((item) => {
        const tag = getTag(item, t);
        return (
          <div className={styles.card} key={item.passkey_id}>
            <div className={styles.left}>
              <IconPasskey className={styles.icon} />
              <div className={styles.meta}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{item.name || item.device_name}</span>
                  {tag ? (
                    <>
                      <span className={styles.divider} />
                      <span className={styles.tag}>{tag}</span>
                    </>
                  ) : null}
                </div>
                <div className={styles.time}>
                  {t('passkey-added-at')}
                  {formatCreateTime(item.create_at)}
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <EditOutlined
                className={styles.actionIcon}
                onClick={() => onRename(item)}
              />
              <DeleteOutlined
                className={styles.actionIcon}
                onClick={() => onDelete(item)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PasskeyList;
