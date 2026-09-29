import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useState } from 'react';
import { goPage } from '@better-bit-fe/base-utils';
import { message } from 'antd';
import { postVipApply } from '~/api';

type ContactMethod = 'telegram' | 'whatsapp';

function useVipApply() {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [contactMethod, setContactMethod] = useState<ContactMethod>('telegram');
  const [contactValue, setContactValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const onApply = () => {
    if (!isLogin) { goPage('login'); return; }
    setIsValid(!contactValue)
    if (!contactValue || loading) return;
    setLoading(true);
    postVipApply({ contact_type: contactMethod, contact_account: contactValue })
      .then(() => message.success(t('vip.apply.success')))
      .catch(() => message.error(t('vip.apply.error')))
      .finally(() => setLoading(false));
  };

  return { contactMethod, setContactMethod, contactValue, setContactValue, loading, onApply, isValid };
}

export default useVipApply;
