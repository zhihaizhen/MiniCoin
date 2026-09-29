import React, { use, useState } from 'react';
import Progress from '../Progress';
import { ReactComponent as ComplateIcon } from '~/public/images/complate.svg';
import { ReactComponent as IncomplateIcon } from '~/public/images/incomplate.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { div, isMobile } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import { useRouter } from 'next/router';
import clc from 'classnames';
import { isInApp, formatThousandDigit } from '~/utils';
import { taskTypeMap } from '~/constants';
import taskLang from '../../mini-translation-temp/Task.json';
import campaignLang from '../../mini-translation-temp/Campaign.json';
import { useUserInfo } from '@better-bit-fe/base-provider';

const TaskList = ({ activity }) => {
  const t = useFm();

  const { locale } = useRouter();
  const { content } = campaignLang[locale] || {};
  const { isLogin } = useUserInfo();
  const taskList = activity?.task_list || [];

  const handleTaskClick = (task) => {
    const { product_type, task_event } = task;
    const {
      btnText = 'btnText',
      taskText = {},
      pageUrl,
      pageUrlH5
    } = taskTypeMap?.[product_type]?.[task_event] || {};
    if (!isInApp()) {
      const url = pageUrl;
      if (url.startsWith('/')) {
        window.location.href = url;
      } else {
        window.location.href = `/${locale}/${url}`;
      }
    } else {
      try {
        const url = pageUrlH5;
        const param = {
          methodName: 'push',
          uniqueId: 'rewardsHub-new-register',
          params: {
            path: url // loginpage表示登录
          }
        };
        console.log('55555调用参数了', param);
        const jsonPrams = JSON.stringify(param);
        (window as any)?.flutter_inappwebview?.callHandler(
          '_b_bridge_Router_',
          jsonPrams
        );
        const cb = (params) => {
          console.log('55555app注册成功的cb调用', params);
          window.location.reload();
        };
        (window as any)._b_bridge_callback_ = cb;
        console.log('55555已经调用了2222', jsonPrams);
      } catch (e) {
        console.log('55555调用失败', e);
      }
    }
  };

  const generateTaskItems = (task, i) => {
    if (!task || !task?.languageConfig?.templateJson) return null;
    const currentTask = taskList.find((item) => item.task_id === task?.id);
    if (!currentTask) return null;
    const {
      process_bar = 0,
      task_event = '',
      compare_value = '-',
      archive_value = '-',
      indicator_type = '',
      task_name = '',
      task_status = '',
      product_type = '',
      show_archive_value = '-'
    } = currentTask || {};

    const { index_title, title = '' } =
      JSON.parse(task?.languageConfig?.templateJson)[locale]?.content || {};

    const { btnText = 'btnText', taskText = {} } =
      taskTypeMap?.[product_type]?.[task_event] || {};

    const desc1 = taskText?.[indicator_type] || 'taskText';

    const isHiddenBtn =
      !isLogin ||
      activity?.campaign_status === 'Expired' ||
      activity?.register_status === 0;

    return (
      <div className={styles.taskItem} key={task_name + i}>
        <div className={styles.left}>
          <div className={styles.sort}>
            <div
              className={clc(
                styles.index_title_container,
                task_status === 'Done' && styles.done
              )}
            >
              {task_status === 'Done' ? <ComplateIcon /> : <IncomplateIcon />}
              <span
                className={clc(
                  styles.index_title,
                  task_status === 'Done' && styles.done
                )}
              >
                {index_title}
              </span>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.title}>{title}</div>
            <div className={styles.text}>
              {t(desc1)}:
              <span className={styles.ponit}>
                {formatThousandDigit(Math.floor(show_archive_value).toString())}
              </span>
              <span>
                /{formatThousandDigit(compare_value)}
                {indicator_type === 'trade_turnover' ? 'USDT' : ''}
              </span>
            </div>
            <div className={styles.text}>
              {t('taskProcess')}:
              <span className={styles.ponit}>{`${process_bar}%`}</span>
            </div>
            <Progress percent={process_bar} />
          </div>
        </div>
        {!isHiddenBtn && (
          <div className={styles.right}>
            {process_bar === 100 && (
              <button disabled className={styles.doneBtn}>
                {t('completed')}
              </button>
            )}
            {process_bar < 100 && (
              <button
                disabled={task_status === 'Done'}
                onClick={() => {
                  if (task_status === 'Done') {
                    return;
                  }
                  handleTaskClick(taskList[i]);
                }}
              >
                {t(`${btnText}`)}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const generateH5TaskItems = (task, i) => {
    if (!task || !task?.languageConfig?.templateJson) return null;
    const currentTask = taskList.find((item) => item.task_id === task?.id);
    if (!currentTask) return null;
    const {
      process_bar = 0,
      task_event = '',
      compare_value = '-',
      archive_value = '-',
      indicator_type = '',
      task_name = '',
      task_status = '',
      product_type = '',
      show_archive_value = '-'
    } = currentTask || {};

    const { index_title, title } =
      JSON.parse(task?.languageConfig?.templateJson)[locale]?.content || {};
    const { btnText = 'btnText', taskText = {} } =
      taskTypeMap?.[product_type]?.[task_event] || {};
    const desc1 = taskText?.[indicator_type] || 'taskText';

    const isHiddenBtn =
      !isLogin ||
      activity?.campaign_status === 'Expired' ||
      activity?.register_status === 0;

    return (
      <div className={styles.taskItem} key={task_name + i}>
        <div className={styles.top}>
          <div className={styles.content}>
            <div
              className={clc(
                styles.titleContainer,
                task_status === 'Done' && styles.done
              )}
            >
              {/* <div className={styles.index_title}>
                {task_status === 'Done' ? (
                  <ComplateIcon className={styles.icon} />
                ) : (
                  <IncomplateIcon className={styles.icon} />
                )} 
                <span>{index_title}</span>
              </div> */}
              <div className={styles.title}>
                {' '}
                <span style={{ marginRight: 2 }}>{index_title}:</span>
                {title}
              </div>
            </div>
            <div className={styles.text}>
              {t(desc1)}:
              <span className={styles.ponit}>
                {formatThousandDigit(Math.floor(show_archive_value).toString())}
              </span>
              <span>
                /{formatThousandDigit(compare_value)}
                {indicator_type === 'trade_turnover' ? 'USDT' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.left}>
            <div className={styles.text}>
              <span>{t('taskProcess')}:</span>
              <span className={styles.ponit}>{`${process_bar}%`}</span>
            </div>
            <Progress percent={process_bar} />
          </div>
          {process_bar === 100 && !isHiddenBtn && (
            <button className={styles.doneBtn}>{t('completed')}</button>
          )}
          {process_bar < 100 && !isHiddenBtn && (
            <button
              disabled={task_status === 'Done'}
              onClick={() => {
                if (task_status === 'Done') {
                  return;
                }
                handleTaskClick(taskList[i]);
              }}
            >
              {t(`${btnText}`)}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.tasksSection}>
      <div className={styles.title}>{content?.taskTitle}</div>
      <div className={styles.des}>{content?.taskDesc}</div>
      <div className={styles.taskItemContainer}>
        {taskLang.map((task, idx) => {
          return isMobile()
            ? generateH5TaskItems(task, idx)
            : generateTaskItems(task, idx);
        })}
      </div>
    </div>
  );
};

export default TaskList;
