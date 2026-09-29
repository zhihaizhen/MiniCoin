import { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';

export type Tab = "order" | "summary";

interface TabSwitcherProps {
  defaultTab?: Tab;
  onChange?: (tab: Tab) => void;
}
const RecordsTab = ({defaultTab = "order", onChange}: TabSwitcherProps) => {
  const t = useFm()
  const [active, setActive] = useState<Tab>(defaultTab);
  const handleClick = (tab: Tab) => {
    setActive(tab);
    onChange?.(tab);
  };
  useEffect(() => {setActive(defaultTab)}, [defaultTab])
  return (
      <div className="relative flex w-full md:w-auto md:min-w-[380px] h-12 md:h-14 rounded-full border border-white/20 bg-[#141414] p-1 cursor-pointer">
        <div
          className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-white transition-all duration-300 ease-in-out ${
            active === "order" ? "left-1" : "left-[calc(50%-4px)]"
          }`}
        />
        <button
          onClick={() => handleClick("order")}
          className={`relative w-[40%] cursor-pointer z-10 flex-1 py-2 text-sm md:text-lg transition-colors duration-300 ${
            active === "order" ? "text-black font-normal" : "text-white font-medium"
          }`}
        >
          {t('lucky-orders')}
        </button>
        <button
          onClick={() => handleClick("summary")}
          className={`relative w-[40%] cursor-pointer z-10 flex-1 py-2 text-sm md:text-lg transition-colors duration-300 ${
            active === "summary" ? "text-black font-normal" : "text-white font-medium"
          }`}
        >
          {t('lucky-summary')}
        </button>
     </div>
  )
}
export default RecordsTab
