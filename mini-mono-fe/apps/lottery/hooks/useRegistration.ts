import { useCallback, useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { message } from 'antd';
import { getRegisterCampaign, registerCampaign } from '~/api';
import { REGISTER_STATUS } from '~/enums';
import { goPage } from '@better-bit-fe/base-utils';

export function useRegistration(isLogin: boolean | undefined, campaignNo: string) {
  const t = useFm();
  const [registerState, setRegisterState] = useState<REGISTER_STATUS>(REGISTER_STATUS.UNKOWN);

  const fetchRegisterStatus = useCallback((no: string) => {
    if (!no) return;
    getRegisterCampaign({ campaign_no: no }).then((res) => {
      setRegisterState(res.is_register === '1' ? res.campaign_audit_status : REGISTER_STATUS.UNKOWN);
    });
  }, []);

  useEffect(() => {
    if (!isLogin || !campaignNo) return;
    fetchRegisterStatus(campaignNo);
  }, [isLogin, campaignNo, fetchRegisterStatus]);

  const onRegister = useCallback(() => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    if (registerState !== REGISTER_STATUS.UNKOWN) return;

    registerCampaign({ campaign_no: campaignNo })
      .then(() => {
        fetchRegisterStatus(campaignNo);
        message.success(t('register-success'));
      })
      .catch((err) => {
        const errorMap: Record<number, string> = {
          35600004: t('register-no-time'),
          35620005: t('register-no-qualification'),
          35600006: t('register-recur'),
        };
        const msg = errorMap[err?.code];
        if (msg) {
          message.warning(msg);
        } else {
          message.error(err?.message || 'register error');
        }
      });
  }, [isLogin, registerState, campaignNo, t, fetchRegisterStatus]);

  return { registerState, onRegister };
}
