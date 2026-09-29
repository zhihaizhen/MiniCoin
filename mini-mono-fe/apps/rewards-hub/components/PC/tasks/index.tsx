import React, { useState, useEffect } from 'react';
import { Tabs, Progress, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { toThousands } from '@unified/helpers';
import { taskTypeMap } from '~/utils';
import { goDetailPage } from '~/utils/url';
import { getPrivateTaskList, getUserJoinActivities, receivedReward } from '~/api';
import { ReactComponent as RightArrow } from '~/public/images/PC/taskArrow.svg';
import { ReactComponent as TaskToken } from '~/public/images/PC/taskToken.svg';
import ClaimSuccessModal from '~/components/claimSuccessModal';
import styles from './index.module.less';


const Tasks = ({ isLogin, needReload, resetTaskReload, openShareModal, refreshCouponCount }) => {
  const t = useFm();
  const { locale } = useRouter();
  const [taskList, setTaskList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimedAward, setClaimedAward] = useState<{
    amount: string;
    token: string;
    name: string;
    productType: string;
  } | null>(null);

  useEffect(() => {
    if (isLogin) {
      fetchUserJoinActivities();
    }
  }, [isLogin])

  useEffect(() => {
    if (needReload) {
      fetchUserJoinActivities()
    }
  }, [needReload])


  const goPage = (url) => {
    if (url.startsWith('/')) {
      window.location.href = url;
    } else {
      window.location.href = `/${locale}/${url}`;
    }
  }

  const fetchUserJoinActivities = async () => {
    setIsLoading(true);
    getPrivateTaskList({ campaign_id: 4422154874 })
      .then((res) => {
        setTaskList(res || []); // 确保设置为数组
        resetTaskReload();
      })
      .catch((err) => {
        setTaskList([]); // 出错时也设置为空数组
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    fetchUserJoinActivities();
    refreshCouponCount?.();
  }

  const getTaskBtn = (task) => {
    const { task_status, product_type, task_event, task_id, task_audit_status } = task;
    {/* 未登录，去注册 */ }
    if (!isLogin) {
      return {
        btnFn: () => goPage('login/register'),
        btnClass: styles.todoBtn,
        btnText: t('goSignUp')
      }
    }
    // {/* 已登录，不是新人,弹窗 */ }
    // if (!isNew) {
    //   return {
    //     btnFn: () => { setModalOpen(true) },
    //     btnClass: styles.todoBtn,
    //     btnText: t('registerNewUser')
    //   }
    // }
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
      const { btnText = 'none', pageUrl } = taskTypeMap?.[product_type]?.[task_event] || {}
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

  const handleLogin = () => {
    window.location.href = `/${locale}/account/login`
  }

  const generateTaskItems = (task, i) => {
    const { process_bar, task_event, compare_value, show_archive_value, indicator_type, product_type, award_volume, award_token } = task
    const { index_title, title = '', } = task?.language_config?.[locale]?.content || {}
    const { taskText = {}, pageUrl } = taskTypeMap?.[product_type]?.[task_event] || {}
    const text = taskText?.[indicator_type] || 'taskText'; //取交易量或者交易次数
    const { btnFn, btnText, btnClass } = getTaskBtn(task)

    return (
      <div className={styles.taskItem} >
        <div className={styles.left}>
          <div className={styles.giftBoxWrapper}>
            <div className={styles.giftAmount}>
              {award_volume}
            </div>
            <div className={styles.giftType}>
              {getGiftType(award_token)}
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.title}>{title}</div>
            <div className={styles.text}>{t(text)}:
              {/* 向下取整 */}
              <span className={styles.point}>{toThousands(Math.floor(show_archive_value))}</span>
              <span>/ {toThousands(compare_value)}{indicator_type === 'trade_turnover' ? 'USDT' : ''}</span>
            </div>
            <div className={styles.text}>{t('taskProcess')}:<span className={styles.point}>{`${process_bar}%`}</span></div>
            <Progress trailColor="#28292a" percent={process_bar} showInfo={false} />
          </div>
        </div>
        <div className={styles.right}>
          <button onClick={btnFn} className={btnClass}>{btnText}</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.tasksSection}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spin
            indicator={
              <LoadingOutlined style={{ color: 'var(--text-brand-default)' }} />
            }
          />
        </div>
      ) : (
        <div className={styles.taskItemContainer}>
          {taskList.length ? (
            taskList.map((task, idx) => generateTaskItems(task, idx))
          ) : (
            <div className={styles.taskEmpty}>
              <div className={styles.activitisEmptyImg} />
              {isLogin && <span>{t('activityEmpty')}</span>}
              {!isLogin && (
                <div className={styles.signIn}>
                  <span>{t('pleaseSignInToViewDailyTasks')}</span>
                  <button className={styles.btn} onClick={handleLogin}>
                    {t('loginOrSign')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <ClaimSuccessModal
        visible={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          fetchUserJoinActivities();
        }}
        claimedAward={claimedAward}
      />
    </div>
  );
};

export default Tasks;