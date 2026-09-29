import { useState, useEffect, useCallback, useRef } from 'react';
import { getBanAreaCheck } from '~/api';
import { getLang } from '@better-bit-fe/base-utils';

const WARN_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

interface BanAreaData {
  country_code?: string;
  name_en?: string;
  name_zh_cn?: string;
  name_zh_hk?: string;
  support_register?: number; // 0=blocked, 1=allowed, 2=warn only
  support_login?: number;
  support_kyc?: number;
}

function getCountryName(data: BanAreaData): string {
  const lang = getLang();
  if (lang === 'zh-CN') return data.name_zh_cn || data.name_en || '';
  if (lang === 'zh-TW') return data.name_zh_hk || data.name_en || '';
  return data.name_en || '';
}

function getStorageKey(mode: string): string {
  return `ip_restrict_warned_at_${mode}`;
}

function isWithinCooldown(mode: string): boolean {
  try {
    const ts = localStorage.getItem(getStorageKey(mode));
    if (!ts) return false;
    return Date.now() - Number(ts) < WARN_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markWarned(mode: string): void {
  try {
    localStorage.setItem(getStorageKey(mode), String(Date.now()));
  } catch {}
}

export const useIpRestrict = (mode: 'register' | 'login') => {
  const [isRestricted, setIsRestricted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countryName, setCountryName] = useState('');
  const modalCloseResolver = useRef<(() => void) | null>(null);

  // 页面加载初始检查
  useEffect(() => {
    (async () => {
      try {
        const res: BanAreaData = await getBanAreaCheck();
        const level = mode === 'register' ? res?.support_register : res?.support_login;
        setCountryName(getCountryName(res));

        if (level === 0) {
          setIsRestricted(true);
          setShowModal(true);
        } else if (level === 2) {
          setIsRestricted(false);
          if (!isWithinCooldown(mode)) {
            setShowModal(true);
            markWarned(mode);
          }
        } else {
          setIsRestricted(false);
        }
      } catch (error) {
        console.error('IP restriction check failed:', error);
      }
    })();
  }, [mode]);

  // 表单提交时调用：level=0 阻止并弹窗，level=2 弹窗等关闭后再放行
  const checkIpRestriction = useCallback(async (): Promise<boolean> => {
    try {
      const res: BanAreaData = await getBanAreaCheck();
      const level = mode === 'register' ? res?.support_register : res?.support_login;
      setCountryName(getCountryName(res));

      if (level === 0) {
        setIsRestricted(true);
        setShowModal(true);
        return true;
      }

      if (level === 2) {
        if (!isWithinCooldown(mode)) {
          setShowModal(true);
          markWarned(mode);
          return new Promise<boolean>((resolve) => {
            modalCloseResolver.current = () => resolve(false);
          });
        }
        return false;
      }

      setIsRestricted(false);
      return false;
    } catch (error) {
      console.error('IP restriction check failed:', error);
      return false;
    }
  }, [mode]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    if (modalCloseResolver.current) {
      modalCloseResolver.current();
      modalCloseResolver.current = null;
    }
  }, []);

  return { isRestricted, showModal, closeModal, checkIpRestriction, countryName };
};
