import React, { useEffect, useState } from 'react';
import { message, Tabs, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { secondFormat } from '~/utils/day';
import { goDetailPage } from '~/utils/url';
import { getPublicActivities, getPrivateActivities, getUserJoinActivities, signUpActivities } from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';


const Activitis = ({ isLogin, taskReloadCb }) => {
  const t = useFm();
  const { locale } = useRouter();
  const [tabKey, setTabKey] = useState('1');
  const [goingActivitiesList, setGoingActivitiesList] = useState([]);
  const [expiredActivitiesList, setExpiredActivitiesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myActivitiesList, setMyActivitiesList] = useState([]);

  useEffect(() => {
    if (isLogin === undefined) {
      return
    }
    fetchGoingActivities()
  }, [isLogin])

  const fetchGoingActivities = () => {
    setIsLoading(true)
    const fetchFn = isLogin ? getPrivateActivities : getPublicActivities;
    fetchFn({ campaign_status: 'Running' }).then(res => {
      const data = res?.records.filter(it => it.id !== 1901900754130731);
      setGoingActivitiesList(data);
    }).catch(() => {}).finally(() => setIsLoading(false))
  }
  const fetchExpiredActivities = () => {
    setIsLoading(true)
    const fetchFn = isLogin ? getPrivateActivities : getPublicActivities;
    fetchFn({ campaign_status: 'Expired' }).then(res => {
      const data = res?.records.filter(it => it.id !== 1901900754130731);
      setExpiredActivitiesList(data);
    }).catch(() => {}).finally(() => setIsLoading(false))
  }

  const fetchUserJoinActivities = () => {
    setIsLoading(true)
    getUserJoinActivities().then(res => {
      const data = res?.records.filter(it => it.id !== 1901900754130731);
      setMyActivitiesList(data);
    }).catch(() => {}).finally(() => setIsLoading(false))
  }


  const getBtnFn = (e, type, params) => {
    e.stopPropagation();
    const { campaign_path, id } = params;
    switch (type) {
      case 'login':
        location.href = `/${locale}/account/login`;  //去登录
        break;
      case 'apply':
        signUpActivities({ campaign_id: id }).then(res => {
          message.success(t('applySuccess'))
          fetchGoingActivities()
          taskReloadCb()
        }).catch(() => {})
        break;
      default:
        goDetailPage(locale, campaign_path);
        break;
    }
  }

  const getTag = (activitis) => {
    const { reward_status, campaign_status } = activitis;
    if (reward_status === 'Done') {
      return t('alreadyGetBox')
    }
    if (campaign_status === 'Expired') {
      return t('activites_finished')
    }

    if (campaign_status === 'Running') {
      return t('activites_progressing')
    }

  }

  const getBtnTags = (activitis) => {
    const { register_status, need_register, campaign_status } = activitis;
    let btn = t('viewAcitivies');
    let btnFn = (e) => getBtnFn(e, 'detail', activitis);
    let btnStyle = styles.todoBtn;
    const tag = getTag(activitis);

    if (!isLogin) {
      // 未登录，进行中的显示登录
      if (campaign_status === 'Running') {
        btn = t('login');
        btnFn = (e) => getBtnFn(e, 'login', activitis);
        btnStyle = styles.todoBtn;
      }
    } else {
      // 已登录，进行中未报名的显示去报名
      if (need_register === 1 && campaign_status === 'Running' && Number(register_status) == 0) {
        btn = t('apply');
        btnFn = (e) => getBtnFn(e, 'apply', activitis)
        btnStyle = styles.todoBtn;
      }

    }
    return {
      btn,
      btnFn,
      btnStyle,
      tag
    }
  }

  const onChange = (key) => {
    setTabKey(key);
    switch (key) {
      case '1':
        fetchGoingActivities();
        break;
      case '2':
        fetchExpiredActivities();
        break;
      case '3':
        fetchUserJoinActivities();
        break;
    }
  }

  const goLandingPage = (e, path) => {
    e.stopPropagation();
    goDetailPage(locale, path)
  }

  const generateActivitisItems = (activitis) => {
    const { banner_title = '', banner_description = '', banner_image } = activitis?.language_config?.[locale]?.content || {}
    const { campaign_status, campaign_begin_time, campaign_end_time, id, campaign_path } = activitis;
    const { btn, btnFn, tag, btnStyle } = getBtnTags(activitis)
    return (
      <div className={styles.activitisItem} key={id} onClick={(e) => goLandingPage(e, campaign_path)}>
        <div className={styles.img}>
          <img src={banner_image} alt="ActivitiesImage" />
        </div>
        <div className={styles.activites}>
          <div className={styles.left}>
            <div className={styles.title}>{banner_title}</div>
            <div className={styles.text}>{banner_description}</div>
            <div className={styles.time}>{t('activites_time')}: {`${secondFormat(campaign_begin_time)} ~ ${secondFormat(campaign_end_time)}`}</div>
          </div>
          <div className={styles.right}>
            <button className={btnStyle} onClick={(e) => btnFn(e)}>{btn}</button>
          </div>
        </div>
        <div className={`${styles.tag} ${campaign_status === 'Expired' ? styles.finished : styles.processing}`}>{tag}</div>
      </div>)
  }


  const getChildren = (list) => {
    return <div className={styles.activitisItemContainer}>
      {isLoading ? <Spin indicator={<LoadingOutlined style={{ color: 'var(--text-brand-default)' }} />} /> : (list.length ? list.map((activitis) => generateActivitisItems(activitis)) : <div className={styles.activitisEmpty}>
        <div className={styles.activitisEmptyImg} />
        <span>{t('activityEmpty')}</span>
      </div>)}
    </div>
  }

  const generateTabItems = () => {
    const itemList = [{
      key: '1',
      label: t('in_progress_activities'),
      children: getChildren(goingActivitiesList)
    },
    {
      key: '2',
      label: t('finished'),
      children: getChildren(expiredActivitiesList)
    }]
    if (isLogin) {
      itemList.push(
        {
          key: '3',
          label: t('my_activities'),
          children: getChildren(myActivitiesList)
        })
    }
    return itemList;
  }

  return (
    <div className={styles.activitisSection}>
      <div className={styles.activitisTitle}>{t('popularActivities')}</div>
      <Tabs
        className={styles.activitisTabs}
        defaultActiveKey="1"
        items={generateTabItems()}
        onChange={onChange}
        indicator={{ size: (origin) => 44, align: 'center' }}
      />
    </div>
  );
};

export default Activitis;