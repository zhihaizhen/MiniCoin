import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';

interface ItemProps {
  index?: number;
  title?: string;
  content?: string;
}

const RuleItem: React.FC<ItemProps> = ({ index, content }) => {
  return (
    <div className="flex justify-start items-start text-sm md:text-base">
      <div className="w-5 h-5 flex justify-center items-start text-[11px] font-medium bg-[#AE1401] rounded-[100px] mt-0.5 pt-[3px]">
        {index}
      </div>
      <div className="flex-1 ml-2 md:ml-3 font-normal">
        {content}
      </div>
    </div>
  );
};

const RuleSubItem: React.FC<ItemProps> = ({ content }) => {
  return (
    <div className="flex items-center text-xs md:text-base ml-8">
      <div
        className="flex items-start before:content-[''] before:inline-block before:w-1.5 before:h-1.5 before:bg-white
        before:rounded-full before:mt-1.5 md:before:mt-2 before:mr-2"
      >
        <span className="flex-1">{content}</span>
      </div>
    </div>
  );
};

type Row = {
  amount: string;
  count: string;
  rate: string;
};


const ActivityRules = () => {
  // const { content } = campaignLang[locale] || {};
  const t = useFm();

  // const RewardData: Row[] = [
  //   {
  //     amount: t('reward-step'),
  //     count: t('reward-unit'),
  //     rate: t('reward-rate')
  //   },
  //   { amount: '88 USDT', count: '1,000', rate: '50.00%' },
  //   { amount: '188 USDT', count: '696', rate: '34.8%' },
  //   { amount: '288 USDT', count: '44', rate: '2.2%' },
  //   { amount: '388 USDT', count: '37', rate: '1.85%' },
  //   { amount: '588 USDT', count: '32', rate: '1.60%' },
  //   { amount: '688 USDT', count: '30', rate: '1.50%' },
  //   { amount: '888 USDT', count: '28', rate: '1.40%' },
  //   { amount: '1,888 USDT', count: '27', rate: '1.35%' },
  //   { amount: '2,026 USDT', count: '26', rate: '1.30%' },
  //   { amount: '3,888 USDT', count: '25', rate: '1.25%' },
  //   { amount: '5,888 USDT', count: '23', rate: '1.15%' },
  //   { amount: '6,888 USDT', count: '21', rate: '1.05%' },
  //   { amount: '8,888 USDT', count: '11', rate: '0.55%' }
  // ];

  return (
    <div className="mx-auto relative w-auto min-h-[450px] text-white flex flex-col justify-center items-center md:w-[1200px] mb-[100px] mt-6">
      <h1 className="text-2xl md:text-[40px] font-semibold w-full text-left">
        {t('rules')}
      </h1>
      <div className="w-full flex flex-col gap-2 mt-6 md:mt-10 rounded-[30px] md:bg-white/10 md:p-6">
        <RuleItem index={1} content={t('rule-1')} />
        <RuleSubItem content={t('rule-1-1')} />
        <RuleItem index={2} content={t('rule-2')} />
        <RuleSubItem content={t('rule-2-1')} />
        <RuleSubItem content={t('rule-2-2')} />
        <RuleItem index={3} content={t('rule-3')} />
        <RuleSubItem content={t('rule-3-1')} />
        {/*<div className="w-[416px] border-b border-[#9E2618] pl-8">*/}
        {/*  {RewardData.map((row, i) => (*/}
        {/*    <div*/}
        {/*      key={i}*/}
        {/*      className="grid grid-cols-3 text-text-primary text-sm h-10 items-center "*/}
        {/*    >*/}
        {/*      <div className="h-full flex items-center justify-center border-l border-t border-[#9E2618]">*/}
        {/*        {row.amount}*/}
        {/*      </div>*/}
        {/*      <div className="h-full flex items-center justify-center border-l border-t border-[#9E2618]">*/}
        {/*        {row.count}*/}
        {/*      </div>*/}
        {/*      <div className="h-full flex items-center justify-center border-l border-t border-r border-[#9E2618]">*/}
        {/*        {row.rate}*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  ))}*/}
        {/*</div>*/}

        <RuleItem index={4} content={t('rule-4')} />
        <RuleItem index={5} content={t('rule-5')} />
        <RuleItem index={6} content={t('rule-6')} />
        <RuleItem index={7} content={t('rule-7')} />
      </div>
    </div>
  );
};

export default ActivityRules;
