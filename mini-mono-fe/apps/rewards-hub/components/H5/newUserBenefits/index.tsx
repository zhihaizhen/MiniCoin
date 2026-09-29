import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Space, SpinLoading, Modal, ProgressBar } from 'antd-mobile'
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { toThousands } from '@unified/helpers';
import { getPrivateTaskList, getPublicTaskList, receivedReward } from '~/api';
import { taskTypeMap, getBitAppVersion, isAppVersionAbove } from '~/utils';
import {
  TASK_TYPES,
  PROGRESS_TASK_KEYS,
  PERIOD_LABEL_KEY,
  getPeriodsByValidDays
} from '~/constants/taskPeriods';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { getIsInPeriod, getCountdownByDays } from '~/utils/day';
import { ReactComponent as GiftBox } from '~/public/images/H5/giftBox.svg';
import ClaimSuccessModal from '~/components/claimSuccessModal';
import styles from './index.module.less';
import { isApp } from 'libs/base-utils/src/browser';

const NewUserBenefits = ({ isLogin, registerTime, openShareModal, refreshCouponCount }) => {
  const t = useFm();
  const { locale, query } = useRouter();
  const [modalOpenBindEM, setModalOpenBindEM] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [activityStartTime, setActivityStartTime] = useState(0);
  const [timerList, setTimerList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stepList, setStepList] = useState<any[]>([]);
  const [validDaysList, setValidDaysList] = useState<number[]>([]);
  const [activePeriodIndex, setActivePeriodIndex] = useState(0);
  const [activeTypeIndex, setActiveTypeIndex] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const periods = useMemo(
    () => getPeriodsByValidDays(validDaysList),
    [validDaysList]
  );
  const activePeriod = periods[activePeriodIndex];

  // periods 变化后若当前选中项越界，重置为第一个
  useEffect(() => {
    if (activePeriodIndex > periods.length - 1) {
      setActivePeriodIndex(0);
    }
  }, [periods.length, activePeriodIndex]);

  const handleTabClick = (index: number) => {
    setActiveTypeIndex(index);
    const tabBar = tabBarRef.current;
    const container = tabBar?.parentElement;
    if (!tabBar || !container) return;
    const activeTab = tabBar.children[index] as HTMLElement;
    if (!activeTab) return;
    const containerWidth = container.offsetWidth;
    const tabLeft = activeTab.offsetLeft;
    const tabWidth = activeTab.offsetWidth;
    const scrollLeft = tabLeft - (containerWidth - tabWidth) / 2;
    container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
  };

  useEffect(() => {
    const typeParam = query.type as string;
    if (!typeParam) return;
    const index = TASK_TYPES.findIndex(item =>
      item.type.some(t => t.toLowerCase() === typeParam.toLowerCase())
    );
    if (index !== -1) {
      handleTabClick(index);
    }
  }, [query.type]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimedAward, setClaimedAward] = useState<{
    amount: string;
    token: string;
    name: string;
    productType: string;
  } | null>(null);

  useEffect(() => {
    if (isLogin === undefined) {
      return
    }
    isLogin ? fetchNewTask() : fetchPublicNewTask()
  }, [isLogin])

  // 倒计时：随激活周期切换重建，组件卸载/切换时清理定时器
  // 与原逻辑保持一致：仅当注册时间在活动开始后且处于当前周期内（isNew）才用 registerTime 推算倒计时，
  // 未登录/非新人/已过期一律不显示倒计时，不做「从当前时间起算」的兜底
  useEffect(() => {
    if (!activePeriod) {
      return;
    }
    const newUser = registerTime ? getIsInPeriod(registerTime, activityStartTime, activePeriod.days) : false;
    setIsNew(newUser);
    setTimerList([]);
    if (!newUser) {
      return;
    }
    const cb = (data) => {
      if (!data) {
        setTimerList([]);
        return;
      }
      setTimerList([
        { timer: data.days, desc: t('day') },
        { timer: data.hours, desc: t('hour') },
        { timer: data.minutes, desc: t('min') },
        { timer: data.seconds, desc: t('sec') }
      ]);
    };
    const intervalId = getCountdownByDays(registerTime, activePeriod.days, cb);
    return () => clearInterval(intervalId);
  }, [registerTime, activityStartTime, activePeriodIndex, activePeriod?.days])

  const fetchNewTask = async () => {
    setIsLoading(true);
    try {
      const { campaign_begin_time, valid_days_list } = await getPublicTaskList({ campaign_id: Number(1901900754130731) });
      setActivityStartTime(campaign_begin_time);
      setValidDaysList(valid_days_list || []);
      const res = await getPrivateTaskList({ campaign_id: Number(1901900754130731) });
      setStepList(res || []);
    } catch { /* ignore */ } finally {
      setIsLoading(false);
    }
  }


  const fetchPublicNewTask = async () => {
    setIsLoading(true)
    const { task_list, campaign_begin_time, valid_days_list } = await getPublicTaskList({ campaign_id: Number(1901900754130731) })
    setActivityStartTime(campaign_begin_time)
    setValidDaysList(valid_days_list || [])
    setStepList(task_list || [])
    setIsLoading(false)
  }

  const goPage = (url) => {
    const isAppPlatform = isApp();
    if (isAppPlatform) {
      handleGoAppPage(url, 'rewardsHub')   //去登录
    } else {
      // 有的是不需要语言前缀的
      if (url.startsWith('/')) {
        window.location.href = url;
      } else {
        window.location.href = `/${locale}/${url}`;
      }
    }
  }

  const getTaskBtn = (task) => {
    const { task_status, task_event, product_type, task_id, task_audit_status } = task;
    {/* 未登录，去注册 */ }
    if (!isLogin) {
      return {
        btnFn: () => goPage('register'),
        btnClass: styles.todoBtn,
        btnText: t('goSignUp')
      }
    }

    // {/* 已登录，不是新人，禁用按钮 */ }
    if (!isNew) {
      return {
        btnFn: () => { },
        btnClass: styles.disabledBtn,
        btnText: t('expired'),
        disabled: true
      }
    }

    {/* 已登录，还是新人，Init:去完成, Done：奖励已领取*/ }
    if (task_status === 'Done') {
      return {
        btnFn: () => { },
        btnClass: styles.doneBtn,
        btnText: t('alreadyGetBox')
      }
    } else if (task_status === 'Awarding') {
      if (task_audit_status === 'approved') {
        return {
          btnFn: () => {
            claimReward(task_id);
          },
          btnClass: styles.todoBtn,
          btnText: t('claim')
        }
      }

      if (task_audit_status === 'rejected') {
        return {
          btnFn: () => {
          },
          btnClass: styles.doneBtn,
          btnText: t('auditRejected')
        }
      }

      return {
        btnFn: () => {
        },
        btnClass: styles.doneBtn,
        btnText: t('auditInProgress')
      }
    } else {
      // 不同类型展示不同文案
      const { btnText, pageUrlH5, pageUrl } = taskTypeMap?.[product_type]?.[task_event] || {}
      const isAppPlatform = isApp();

      if (isAppPlatform) {
        return {
          btnFn: () => {
            if (task_event === 'once_user_bind_em_mob') {
              // APP 1.7.0 以下版本不支持跳转绑定邮箱/手机号页面，使用原生弹窗
              const appVersion = getBitAppVersion(navigator.userAgent || '');
              if (appVersion && !isAppVersionAbove(appVersion, '1.7.0')) {
                setModalOpenBindEM(true);
                return;
              }
            }

            goPage(pageUrlH5)
          },
          btnClass: styles.todoBtn,
          btnText: btnText ? t(btnText) : ''
        }
      }

      return {
        btnFn: () => {
          if (task_event === 'once_user_invite') {
            openShareModal?.()
          } else {
            goPage(pageUrl)
          }
        },
        btnClass: styles.todoBtn,
        btnText: btnText ? t(btnText) : ''
      }
    }
  }

  const claimReward = async (taskId) => {
    const res = await receivedReward(taskId);
    if (res) {
      const { award_amount, award_token, coupon_type, reward_product_type } = res;
      setClaimedAward({
        amount: award_amount || '0',
        token: award_token || 'USDT',
        name: coupon_type || '',
        productType: reward_product_type || ''
      });
      setShowClaimModal(true);
    }
    const privateTasks = await getPrivateTaskList({ campaign_id: Number(1901900754130731) })
    setStepList(privateTasks || [])
    refreshCouponCount?.()
  }

  const getGiftType = (type) => {
    switch (type) {
      case 'PreGivenCash':
        return `USDT ${t('future-trial-cash')}`;
      case 'ServiceCash':
        return `USDT ${t('fee-deduct-coupon')}`;
      case 'PostGivenCash':
        return `USDT ${t('future-trial-cash-post')}`;
      default:
        return ''; //
    }
  }

  const handlePeriodClick = (index) => {
    setActivePeriodIndex(index);
    setActiveTypeIndex(0);
  }

  const periodList = stepList.filter((item) => item.valid_days === activePeriod?.days);
  const visibleList = activePeriod?.showTypeFilter
    ? periodList.filter((item) => {
      const activeType = TASK_TYPES[activeTypeIndex];
      if (activeType.type.length === 0) {
        return true;
      }
      return activeType.type.includes(item.product_type);
    })
    : periodList;

  return (
    <div className={styles.newUserBenefits}>
      {/* 一级 tab：活动周期 */}
      <div className={styles.mainTab}>
        {periods.map((period, i) => (
          <span
            key={period.key}
            className={`${styles.mainTabItem} ${i === activePeriodIndex ? styles.active : ''}`}
            onClick={() => handlePeriodClick(i)}
          >
            {t(PERIOD_LABEL_KEY, { days: period.days })}
          </span>
        ))}
      </div>
      {/* 二级 tab：类型筛选，仅 7天 显示 */}
      {activePeriod?.showTypeFilter && <div className={styles.typeFilter}>
        <div className={styles.tabBar} ref={tabBarRef}>
          {
            TASK_TYPES.map((it, i) => (
              <span key={i} className={`${styles.tabItem} ${i === activeTypeIndex ? styles.active : ''}`} onClick={() => handleTabClick(i)}>
                {t(it.key)}
                {it.showNew && <span className={styles.newBadge}>NEW</span>}
              </span>
            ))
          }
        </div>
      </div>}
      {timerList.length > 0 && <div className={styles.timer}>
        {timerList.map((it, i) => {
          return <div className={styles.boxContainer} key={i}>
            <div className={styles.box}>
              <span className={styles.timerNumber}>{it.timer}</span>
              <span className={styles.timerLabels}>{it.desc}</span>
            </div>
            {(i < 3) && <span className={styles.timerSemi}>:</span>}
          </div>
        })}
      </div>}
      <div className={styles.tasksContainer}>
        {isLoading ? <Space direction='vertical' className={styles.loadingContainer}>
          <SpinLoading color='var(--text-brand-default)' />
        </Space> : visibleList.map((it, i) => {
          const { award_volume, task_status, award_token, product_type, task_event, process_bar, compare_value, archive_value, indicator_type } = it;
          const { title, desc1 } = it?.language_config?.[locale]?.content || {};
          const { btnFn, btnText, btnClass, disabled } = getTaskBtn(it)

          // 判断是否需要显示进度（首充奖励或合约交易）
          const showProgress = PROGRESS_TASK_KEYS.has(`${product_type}:${task_event}`);

          return <div className={styles.step} key={i}>
            <div className={`${styles.tag} ${styles[activePeriod?.tagVariant] || ''}`}>{t(activePeriod?.tagKey, { days: activePeriod?.days })}</div>
            <div className={styles.giftBoxWrapper}>
              <div className={styles.giftAmount}>
                {award_volume}
              </div>
              <div className={styles.giftType}>
                {getGiftType(award_token)}
              </div>
            </div>
            <div className={styles.title}>{title}</div>
            <div className={styles.desc}>{desc1}</div>
            {showProgress && (
              <div className={styles.progressWrapper}>
                <ProgressBar
                  percent={process_bar || 0}
                  style={{
                    '--track-color': '#28292a',
                    '--fill-color': 'var(--fill-button-brand-default)',
                    '--track-width': '6px'
                  }}
                />
                <div className={styles.progressInfo}>
                  <div className={styles.progressLeft}>
                    <span className={styles.progressCurrent}>
                      {archive_value ? toThousands(Math.floor(archive_value)) : '--'}
                    </span>
                    <span className={styles.progressGoal}>
                      &nbsp;/&nbsp;{toThousands(compare_value)}{indicator_type === 'trade_turnover' ? ' USDT' : ''}
                    </span>
                  </div>
                  <span className={styles.progressPercent}>{`${process_bar || 0}%`}</span>
                </div>
              </div>
            )}
            <div className={styles.content}>
              <button onClick={btnFn} className={btnClass} disabled={disabled}>{btnText}</button>
            </div>
          </div>
        })}
      </div>
      <Modal
        bodyClassName={styles.modalMask}
        className={styles.modalMask}
        visible={modalOpenBindEM}
        closeOnAction
        content={<div className={styles.modalContent}>
          <div className={styles.contentWrapper}>
            <p className={styles.contentTitle}>{t('appDirectToBindEmailTitle')}</p>
            <p className={styles.contentDesc}>{t('appDirectToBindEmailDesc')}</p>
          </div>
          <button onClick={() => { setModalOpenBindEM(false); }}>{t('confirm')}</button>
        </div>
        }
      />
      <ClaimSuccessModal
        visible={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          fetchNewTask();
        }}
        claimedAward={claimedAward}
      />
    </div>
  );
};

export default NewUserBenefits;
