import { Checkbox } from 'common/antdComponents';
import { Popover, Tooltip } from 'antd';
import { storage } from 'by-storage';
import cls from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { types, useGlobalState } from '@/store';
import { saveDoubleConfirm } from '@/services/user.service';
import { handleLoginUrl } from 'common/utils/url';
import {
  QUICK_OPERATION_CHECKLIST,
} from 'common/packages-biz/global-settings/localStorageSettings';
import styles from './index.module.less';

const DEFAULT_CHECKLIST = {
  trade: 'show',
  entrust: 'show',
};

const GUEST_CHECKLIST = {
  trade: 'show',
  entrust: 'hide',
};

const QuickOperationDialog = memo(
  ({ handleSetChecklistStatus, getContainer, loggedIn, children }) => {
    const [t] = useTranslation();
    const [globalState, globalDispatch] = useGlobalState();
    const { user } = globalState;

    const loadChecklistFromStorage = useCallback(() => {
      const storeCheckList = storage.get(QUICK_OPERATION_CHECKLIST);
      return storeCheckList
        ? JSON.parse(storeCheckList)
        : { ...DEFAULT_CHECKLIST };
    }, []);

    const [checklistStatus, setChecklistStatus] = useState(() =>
      loggedIn ? loadChecklistFromStorage() : { ...GUEST_CHECKLIST },
    );
    const [curDoubleConfirmList, setcurDoubleConfirmList] = useState([]);

    const persistGuestChecklist = useCallback(
      (nextStatus) => {
        storage.set(QUICK_OPERATION_CHECKLIST, JSON.stringify(nextStatus));
        handleSetChecklistStatus(nextStatus);
      },
      [handleSetChecklistStatus],
    );

    const persistChecklist = useCallback(
      (nextStatus) => {
        const newList = curDoubleConfirmList;
        setcurDoubleConfirmList(newList);
        saveDoubleConfirm(newList).then(() => {
          globalDispatch({
            type: types.UPDATE_ORDER_CONFIRM,
            newDoubleConfirm: newList.join(','),
          });
        });

        storage.set(QUICK_OPERATION_CHECKLIST, JSON.stringify(nextStatus));
        handleSetChecklistStatus(nextStatus);
      },
      [curDoubleConfirmList, globalDispatch, handleSetChecklistStatus],
    );

    const handleClickCheckItem = (type, val) => {
      if (!loggedIn) {
        if (type !== 'trade') {
          if (val) {
            handleLoginUrl();
          }
          return;
        }
        const nextStatus = {
          ...GUEST_CHECKLIST,
          trade: val ? 'show' : 'hide',
        };
        setChecklistStatus(nextStatus);
        persistGuestChecklist(nextStatus);
        return;
      }

      const nextStatus = {
        ...checklistStatus,
        [type]: val ? 'show' : 'hide',
      };
      setChecklistStatus(nextStatus);
      persistChecklist(nextStatus);
    };

    const DISPLAY_ITEMS = [
      { key: 'trade', text: t('showQuickTrade') },
      { key: 'entrust', text: t('showEntrustOrder') },
    ];

    useEffect(() => {
      if (!loggedIn) {
        setChecklistStatus({ ...GUEST_CHECKLIST });
        return;
      }
      setChecklistStatus(loadChecklistFromStorage());
    }, [loggedIn, loadChecklistFromStorage]);

    useEffect(() => {
      if (!loggedIn || !user?.info?.double_confirm) {
        return;
      }
      const defaultDoubleConfirmList =
        user?.info?.double_confirm?.split(',') ?? [];
      setcurDoubleConfirmList(defaultDoubleConfirmList);
    }, [loggedIn, user?.info?.double_confirm]);

    return (
      <Popover
        overlayClassName="quick-operation-popover"
        showArrow={false}
        content={
          <div className={styles.panel}>
            {DISPLAY_ITEMS.map((item) => (
              <div className={styles.klineDialogItem} key={item.key}>
                <Checkbox
                  checked={checklistStatus[item.key] === 'show'}
                  onChange={(e) => {
                    handleClickCheckItem(item.key, e.target.checked);
                  }}
                >
                  <span
                    className={cls(
                      styles.klineDialogTip,
                      checklistStatus[item.key] === 'show'
                        ? styles.checked
                        : styles.unchecked,
                    )}
                  >
                    {item.text}
                  </span>
                </Checkbox>
              </div>
            ))}
          </div>
        }
        trigger="hover"
        placement="bottomLeft"
        mouseEnterDelay={0.1}
        mouseLeaveDelay={0.1}
        getPopupContainer={getContainer}
      >
        {children}
      </Popover>
    );
  },
);

QuickOperationDialog.defaultProps = {
  handleSetChecklistStatus() {},
  getContainer: undefined,
  loggedIn: false,
  children: null,
};

QuickOperationDialog.propTypes = {
  handleSetChecklistStatus: PropTypes.func,
  getContainer: PropTypes.func,
  loggedIn: PropTypes.bool,
  children: PropTypes.node,
};

export default QuickOperationDialog;
