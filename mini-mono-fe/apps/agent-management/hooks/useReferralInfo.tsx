import { useState } from 'react';
import { getDefaultReferralLink } from '~/api';

const useReferralInfo = () => {
  const [loading, setLoading] = useState(false);
  const [defaultReferralLink, setDefaultReferralLink] = useState(null);

  const fetchDefaultReferralLink = async () => {
    try {
      setLoading(true);
      const res = await getDefaultReferralLink();
      if (res.records && res.records.length > 0) {
        const defaultFlagData = res.records.filter(
          (it) => it.defaultFlag == 1
        )[0];
        setDefaultReferralLink(defaultFlagData);
        console.log('__DEFAULT_REFERRAL_LINK', res.records[0]);
      }
    } catch (e) {
      console.warn(e);
    }
    setLoading(false);
  };

  return {
    loading,
    defaultReferralLink,
    fetchDefaultReferralLink
  };
};

export default useReferralInfo;
