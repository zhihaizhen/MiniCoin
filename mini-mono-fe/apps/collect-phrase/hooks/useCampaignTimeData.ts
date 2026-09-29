import { CampaignDetail } from '~/interface';
import { useMemo } from 'react';
import { CampaignStatus } from '~/enums';
import dayjs from 'dayjs';

interface CampaignTimeData {
  timeTips: string;
  dateRangeStr: string;
  countdownEndTime: number;
  countdownBeginTime: number;
}

const useCampaignTimeData = (
  campaignDetail: CampaignDetail,
  t: (key: string) => string
): CampaignTimeData => {
  return useMemo(() => {
    const status = campaignDetail?.campaign_status || CampaignStatus.NotStarted;
    const isOnReward = status === CampaignStatus.OnReward;

    const timeTipsMap = {
      [CampaignStatus.NotStarted]: t('notStartedTip'),
      [CampaignStatus.Ongoing]: t('onRwardStartTip'),
      [CampaignStatus.OnReward]: t('onRwardEndTip')
    };

    const formatDateRange = (beginTime?: string, endTime?: string): string => {
      if (!beginTime || !endTime) return '';
      const formattedBegin = dayjs
        .unix(+beginTime)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss');
      const formattedEnd = dayjs
        .unix(+endTime)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss');
      return `${formattedBegin}  ~  ${formattedEnd} (UTC+0)`;
    };

    return {
      timeTips: timeTipsMap[status] || '',
      dateRangeStr: formatDateRange(
        campaignDetail?.campaign_begin_time,
        campaignDetail?.claim_end_time
      ),
      countdownEndTime: +(isOnReward
        ? campaignDetail?.claim_end_time
        : campaignDetail?.campaign_end_time),
      countdownBeginTime: +(isOnReward
        ? campaignDetail?.claim_begin_time
        : campaignDetail?.campaign_begin_time)
    };
  }, [campaignDetail, t]);
};

export default useCampaignTimeData;
