import { useEffect, useState } from 'react';
import RecordTab, { Tab } from '~/components/common/RecordTab';
import PositionTable from '~/components/common/PositionTable';
import HistoryTable from '~/components/common/HistoryTable';
interface Props {
  campaignNo: string;
  luckNoticeNum:number;
  updateLuckyNum: (n:number) => void;
  isBlock?: boolean;
}
const RecordsView = ({campaignNo, luckNoticeNum, updateLuckyNum, isBlock}:Props) => {

  const [tabType, setTabType] = useState<Tab> ("order");
  const onTabChange = (tab:Tab) => {
    setTabType(tab)
  }

  useEffect(() => {
    setTabType('order');
  }, [luckNoticeNum])

  return (
    <div className="relative text-white w-full flex flex-col justify-start items-center gap-6 md:gap-10 md:mt-10 px-4 md:px-6">
      <RecordTab defaultTab={tabType} onChange={onTabChange} />
      {tabType === "order" ? <PositionTable luckNoticeNum={luckNoticeNum} updateLuckyNum={updateLuckyNum} campaignNo={campaignNo} isBlock={isBlock} /> : <HistoryTable luckNoticeNum={luckNoticeNum} campaignNo={campaignNo} isBlock={isBlock} />}

    </div>
  )
}
export default RecordsView
