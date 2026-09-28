import { useFm } from "@better-bit-fe/base-hooks";
import React, { useEffect, useState } from 'react';
import { getBonusRecentRecord, getRecentPrizeRecord } from '~/api';
import VerticalMarquee from '~/components/common/RecordMarquee/VerticalMarquee';

interface RecordMarqueeProps {
  type?: string;
  campaignNo?: string
}
const RecordMarquee = ({type, campaignNo}: RecordMarqueeProps) => {
  const t = useFm();
  const [luckyRecords, setLuckyRecords] = useState([]);


  useEffect(() => {
    if(!campaignNo) return;
    if(type === 'red-envelope') {
      getBonusRecentRecord({campaign_no: campaignNo}).then((res) => {
        setLuckyRecords( Array.isArray(res.records) ? res.records : [] )
      });
      return
    }
    getRecentPrizeRecord({campaign_no: campaignNo}).then((res) => {
      setLuckyRecords( Array.isArray(res.records) ? res.records : [] )
    });
  }, [type, campaignNo]);

  return (
    <div className="absolute left-[-50px] top-[100px] w-[250px] md:w-[310px] h-[150px] md:h-[300px] flex items-center justify-start select-none z-2" >
      <VerticalMarquee
        items={luckyRecords.map((item) => {
          return (
            <div key={item.user_id} className="bg-[rgba(35,35,35,0.74)] w-[150px] md:w-[250px] h-5 md:h-10 rounded-tr-xl rounded-br-xl pl-[30px] md:pl-5 flex justify-start items-center gap-1 mx-6 sm:mx-10 whitespace-nowrap">
              <span className="text-white text-[6px] md:text-xs">
               {t('lucky-get', {userid: item.user_id})}
              </span>
              <span className={` text-[8px] md:text-sm font-bold ${type === 'red-envelope' ? 'text-[#ABE127]' : 'text-text-brand-default'}`}>
                {`${+item.award_amount} ${item.award_token}`}
              </span>
            </div>
          )
        })}
        speed={40}
      />

    </div>
  );
};

export default RecordMarquee;
