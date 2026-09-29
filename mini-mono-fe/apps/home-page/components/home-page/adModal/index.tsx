import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getLang, isMobile } from '@better-bit-fe/base-utils';
import { getPrivateOpenAdList, getPublicOpenAdList } from '~/api';
import dayjs from 'dayjs';
import { useUserInfo } from '@better-bit-fe/base-provider';
import {
  DisplayFrequency,
  IAdProps,
  IAdStoreProps,
  LoginState,
  UserTypes
} from '~/interface';
import AdPcSwiper from './AdPcSwiper';
import AdMobileSwiper from './AdMobileSwiper';


const HOME_MODAL_AD_LIST_KEY = 'HOME_MODAL_AD_LIST';
const HIDE_HOME_AD_MODAL_DAY_KEY = 'HIDE_HOME_AD_MODAL_DAY';
const FORMAT_DAY = 'YYYY-MM-DD HH:mm:ss';

const safeGetLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

const safeSetLocalStorageItem = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
};

const safeParseJson = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const ReferralShareModal: React.FC = () => {
  const lang = getLang();
  const [showAdList, setShowAdList] = useState<IAdProps[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isHideToday, setIsHideToday] = useState(false);

  const scrollYRef = useRef<number | null>(null);

  const { isLogin, userInfo } = useUserInfo();

  const onIsHideTodayChange = () => {
    setIsHideToday((prev) => !prev);
  };

  const handleClose = () => {
    setModalOpen(false);
    // const today = dayjs().format('YYYY-MM-DD');
    // safeSetLocalStorageItem(
    //   HIDE_HOME_AD_MODAL_DAY_KEY,
    //   isHideToday ? today : ''
    // );
  };


  const updateAdStore = useCallback((records: IAdProps[]): void => {
    if (!Array.isArray(records) || records.length === 0) return;
    if (typeof window === 'undefined') return;

    const raw = safeGetLocalStorageItem(HOME_MODAL_AD_LIST_KEY);
    const adStoreList = safeParseJson<IAdStoreProps[]>(raw, []);
    const nowDateStr = dayjs().format(FORMAT_DAY);

    const nextStoreList: IAdStoreProps[] = [...adStoreList];

    records.forEach((ad) => {
      const index = nextStoreList.findIndex((item) => item.code === ad.code);
      if (index > -1) {
        const prev = nextStoreList[index];
        let displayNum = (prev.displayed_num || 0) + 1;

        // 每次进入展示：跨天时重置为 1
        if (
          prev.display_frequency === DisplayFrequency.EVERY_TIME &&
          prev.displayed_date !== nowDateStr
        ) {
          displayNum = 1;
        }

        nextStoreList[index] = {
          ...prev,
          displayed_date: nowDateStr,
          displayed_num: displayNum
        };
      } else {
        nextStoreList.push({
          code: ad.code,
          display_frequency: ad.display_frequency,
          displayed_date: nowDateStr,
          login_status: ad.login_status,
          displayed_num: 1,
          old_max_daily_display_num: ad.same_user_max_daily_display_frequency
        });
      }
    });

    safeSetLocalStorageItem(
      HOME_MODAL_AD_LIST_KEY,
      JSON.stringify(nextStoreList)
    );
  }, []);

  /**
   * 过滤广告列表（登录状态、语言、时间、展示频次等）
   */
  const handleFilterAdList = useCallback(
    (records: IAdProps[]): IAdProps[] => {
      // console.log('step2过滤广告列表', records, userInfo)
      if (!Array.isArray(records) || records.length === 0) return [];

      let filteredAdList: IAdProps[] = [];

      // 登录状态及新老用户筛选
      if (userInfo) {
        filteredAdList = records.filter(
          (ad) =>
            !ad.login_status ||
            ad.login_status.includes(LoginState.LOGGED_IN)
        );

        const registerTimeSeconds = userInfo.registerTime;
        // console.log('step3是否有注册时间', registerTimeSeconds, filteredAdList)
        if (registerTimeSeconds) {
          const registerTimeMs = registerTimeSeconds * 1000;
          const diffDays = dayjs().diff(dayjs(registerTimeMs), 'day');
          if (diffDays <= 7) {
            // 新用户
            filteredAdList = filteredAdList.filter(
              (ad) =>
                !ad.user_type ||
                ad.user_type.split(',').includes(UserTypes.NEW_USER)
            );
          } else {
            // 老用户
            filteredAdList = filteredAdList.filter(
              (ad) =>
                !ad.user_type ||
                ad.user_type.split(',').includes(UserTypes.OLD_USER)
            );
          }
        }
      } else {
        filteredAdList = records.filter(
          (ad) =>
            !ad.login_status ||
            ad.login_status.includes(LoginState.NOT_LOGED_IN)
        );
      }

      // 语言筛选
      filteredAdList = filteredAdList.filter(
        (ad) =>
          !ad.language_area ||
          ad.language_area.split(',').includes(lang)
      );

      // 开始/结束时间筛选
      filteredAdList = filteredAdList.filter((ad) => {
        const begin = ad.begin_time;
        const end = ad.end_time;
        const now = dayjs();

        const validBeginTime = begin != null && +begin > 0;
        const validEndTime = end != null && +end > 0;

        if (!validBeginTime && !validEndTime) return true;

        if (!validBeginTime && validEndTime) {
          return now.isBefore(dayjs(+end * 1000));
        }
        if (!validEndTime && validBeginTime) {
          return now.isAfter(dayjs(+begin * 1000));
        }

        // begin & end 都有效
        return (
          now.isAfter(dayjs(+begin * 1000)) &&
          now.isBefore(dayjs(+end * 1000))
        );
      });

      // console.log('step4晒出不合格的广告时间', filteredAdList)
      // 展示频次筛选：读取本地缓存
      if (typeof window !== 'undefined') {
        const raw = safeGetLocalStorageItem(HOME_MODAL_AD_LIST_KEY);
        const adStoreList = safeParseJson<IAdStoreProps[]>(raw, []);
        const today = dayjs().format(FORMAT_DAY);

        filteredAdList = filteredAdList.filter((ad) => {
          const frequency = ad.display_frequency as DisplayFrequency | undefined;
          const storeAd = adStoreList.find(
            (item) => item.code === ad.code
          );
          const maxDisplayNum = Number(
            ad.same_user_max_daily_display_frequency || 0
          );
          // 未配置频次 或 没有本地记录：放行
          if (!frequency || !storeAd) return true;

          if (frequency === DisplayFrequency.EVERY_TIME) {
            // 每次进入，按“每日最多 X 次”限制
            if (!maxDisplayNum) return true; // 未配置最大次数，不限
            if (storeAd.displayed_date !== today) {
              // 新的一天重新开始计数
              return true;
            }
            return (storeAd.displayed_num || 0) < maxDisplayNum;
          }

          if (frequency === DisplayFrequency.ONCE_DAILY) {
            // 一天只展示一次：当天没展示过才展示
            return storeAd.displayed_date !== today;
          }

          if (frequency === DisplayFrequency.FIRST_TIME) {
            // 首次进入展示一次：本地没有记录才展示
            return !storeAd.displayed_date;
          }

          // 未知频次配置：不放行
          return false;
        });
        // console.log('step5读取本地缓存后', filteredAdList)
      }
      if (isMobile()) {
        filteredAdList = filteredAdList.filter(
          (ad) => !!ad.pic_h5_dark_url || !!ad.pic_app_dark_url
        );
      } else {
        filteredAdList = filteredAdList.filter(
          (ad) => !!ad.pic_web_dark_url
        );
      }

      return filteredAdList;
    },
    [lang, userInfo]
  );

  /**
   * 初始化：根据登录态 & 今日是否隐藏，拉取广告
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLogin === undefined) return;

    const today = dayjs().format(FORMAT_DAY);
    const hideDay = safeGetLocalStorageItem(HIDE_HOME_AD_MODAL_DAY_KEY)?.trim();
    // 非初次进入
    if (hideDay) {
      // 兼容之前YYYY-MM-DD格式,需要转换成YYYY-MM-DD HH:mm:ss格式
      const isOldHideDayFormat = /^\d{4}-\d{2}-\d{2}$/.test(hideDay);
      const normalizedHideDay = isOldHideDayFormat
        ? `${hideDay} 00:00:00`
        : hideDay;
      const after24hWithHideDay = dayjs(normalizedHideDay).add(1, 'day').format(FORMAT_DAY);
      // 确定是否在24小时之内，保证24小时只展示一次
      const isHideFlag = after24hWithHideDay > today;

      // console.log('step1用户不是首次进来', isOldHideDayFormat, hideDay, normalizedHideDay, after24hWithHideDay, today)
      if (isHideFlag) return;
      //  24小时之外，重置缓存
      if (!isHideFlag) {
        safeSetLocalStorageItem(
          HIDE_HOME_AD_MODAL_DAY_KEY,
          today
        );
      }
    }

    let cancelled = false;
    const fetchAds = async () => {
      try {
        if (isLogin === false) {
          const res = await getPublicOpenAdList({});
          const records = Array.isArray(res?.records) ? res.records : [];
          const filterList = handleFilterAdList(records);
          filterList.sort((a, b) => (a.seq || 0) - (b.seq || 0));
          if (!cancelled) {
            setShowAdList(filterList);
            setModalOpen(filterList.length > 0);
            // 
            if (!hideDay && filterList.length > 0) {
              // 用户首次进来且有广告的时候，设置24小时只展示一次
              safeSetLocalStorageItem(
                HIDE_HOME_AD_MODAL_DAY_KEY,
                today
              );
            }
          }
        } else if (isLogin === true) {
          const res = await getPrivateOpenAdList({});
          const records = Array.isArray(res?.records) ? res.records : [];
          const filterList = handleFilterAdList(records);
          filterList.sort((a, b) => (a.seq || 0) - (b.seq || 0));
          // console.log('step6过滤后的数据', !cancelled, filterList)

          if (!cancelled) {
            setShowAdList(filterList);
            setModalOpen(filterList.length > 0);
            if (!hideDay && filterList.length > 0) {
              // 用户首次进来且有广告的时候，设置24小时只展示一次
              safeSetLocalStorageItem(
                HIDE_HOME_AD_MODAL_DAY_KEY,
                today
              );
            }
          }
        }
      } catch {
        // 失败就不展示弹窗
        if (!cancelled) {
          setShowAdList([]);
          setModalOpen(false);
        }
      }
    };

    fetchAds();

    return () => {
      cancelled = true;
    };
  }, [handleFilterAdList, isLogin]);

  /**
   * 弹窗打开时，更新展示次数缓存
   */
  useEffect(() => {
    if (!modalOpen || showAdList.length === 0) return;
    updateAdStore(showAdList);
  }, [modalOpen, showAdList, updateAdStore]);

  /**
   * 控制 body 滚动
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (modalOpen) {
      // 记录当前滚动位置
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.overflow = 'hidden';
    } else {
      const body = document.body;
      const scrollY = scrollYRef.current ?? 0;

      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = '';

      // 回到原来的滚动位置
      window.scrollTo(0, scrollY);
      scrollYRef.current = null;
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen || typeof window === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [modalOpen, isHideToday]);

  if (!modalOpen) return null;

  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-999 bg-fill-mask flex justify-center items-center">
      <div className="w-[315px] h-[500px] md:w-auto md:h-[584px] rounded-2xl">
        <AdPcSwiper
          close={handleClose}
          adList={showAdList}
          onIsHideTodayChange={onIsHideTodayChange}
        />
        <AdMobileSwiper
          close={handleClose}
          adList={showAdList}
          onIsHideTodayChange={onIsHideTodayChange}
        />
      </div>
    </div>
  );
};

export default ReferralShareModal;
