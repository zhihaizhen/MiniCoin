import { referralLinkHost, referralLinkPath } from '~/env';

export const generateReferralLink = (referralCode = '') => {
  return `${referralLinkHost}${referralLinkPath}${referralCode}`;
};
