import { useEffect, useState } from 'react';
import { getCampaignMultilangList } from '~/api';

interface BannerData {
  mainTitle: string;
  subTitle: string;
  entryVideoUrl: string;
  loopVideoUrl: string;
  loopVideoUrlH5: string;
  picUrl?: string;
  picH5Url?: string;
  redirectUrl?: string;
  redirectH5Url?: string;
}

export const useCampaignBanner = () => {
  const [data, setData] = useState<BannerData>({
    mainTitle: '',
    subTitle: '',
    entryVideoUrl: '',
    loopVideoUrl: '',
    loopVideoUrlH5: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCampaignMultilangList({ campaign_code: 'home-page' })
      .then((res) => {
        setData({
          mainTitle: res?.mainTitle,
          subTitle: res?.subTitle,
          entryVideoUrl: res?.web_entry_video_url || res?.web_loop_video_url,
          loopVideoUrl: res?.web_loop_video_url || res?.web_entry_video_url,
          loopVideoUrlH5: res?.h5_loop_video_url || res?.h5_entry_video_url || res?.web_loop_video_url || res?.web_entry_video_url,
          picUrl: res?.pic_web_url,
          picH5Url: res?.pic_h5_url || res?.pic_web_url,
          redirectUrl: res?.redirect_web_url || res?.redirect_h5_url,
          redirectH5Url: res?.redirect_h5_url || res?.redirect_web_url,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
