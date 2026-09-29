import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getPublicBigCampaignDetails } from '~/api';
import { ACTIVE_STATUS } from '~/enums';
import { ICompaignProp } from '~/interface';

export function useCampaignInfo(isLogin: boolean | undefined, api: () => Promise<ICompaignProp> = getPublicBigCampaignDetails) {
  const [activeTime, setActiveTime] = useState('');
  const [shareTime, setShareTime] = useState('');
  const [actState, setActState] = useState(ACTIVE_STATUS.NOT_START);
  const [campaignNo, setCampaignNo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api()
      .then((res: ICompaignProp) => {
        if (!res) return;

        const { campaign_no, campaign_begin_time, campaign_end_time } = res;

        if (campaign_no) setCampaignNo(campaign_no);

        if (campaign_begin_time && campaign_end_time) {
          const begin = +campaign_begin_time;
          const end = +campaign_end_time;

          const beginTime = dayjs.unix(begin).utc().format('YYYY-MM-DD HH:mm:ss');
          const endTime = dayjs.unix(end).utc().format('YYYY-MM-DD HH:mm:ss');
          setActiveTime(`${beginTime}  ~  ${endTime} (UTC+0)`);
          const beginDate = dayjs.unix(begin).utc().format('YYYY-MM-DD');
          const endDate = dayjs.unix(end).utc().format('YYYY-MM-DD');
          setShareTime(`${beginDate}  ~  ${endDate} (UTC+0)`);

          const now = dayjs.utc().unix();
          if (now < begin) {
            setActState(ACTIVE_STATUS.NOT_START);
          } else if (now <= end) {
            setActState(ACTIVE_STATUS.RUNING);
          } else {
            setActState(ACTIVE_STATUS.END);
          }
        }
      })
      .finally(() => {
        if (isLogin === false) setLoading(false);
      });
  }, [isLogin, api]);

  return { activeTime, shareTime, actState, campaignNo, loading, setLoading };
}
