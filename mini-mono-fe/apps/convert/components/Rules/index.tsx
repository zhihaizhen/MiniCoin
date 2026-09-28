import React, { useState } from 'react';
import { ReactComponent as PlusIcon } from '~/public/images/plus.svg';
import { ReactComponent as MinusIcon } from '~/public/images/minus.svg';
import { useFm } from '@better-bit-fe/base-hooks';

const RulesItem = ({title, children}) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`group/parent w-full py-9  cursor-pointer border-b border-line-border-default `}
         onClick={() => setCollapsed(!collapsed)}>

      <div className="w-full flex items-center justify-between">
        <span className="grandchild  group-hover/parent:text-text-brand-hover  flex-1 pr-2 text-base md:text-lg font-semibold ">{title}</span>
        <div className="grandchild  group-hover/parent:bg-fill-button-brand-hover w-6 h-6 rounded-md bg-fill-button-tertiary-default text-xs flex items-center justify-center">
          {collapsed ? <MinusIcon /> : <PlusIcon />}
        </div>
      </div>
      { collapsed && children }
    </div>
  )
}

const RulesView = () => {
  const t = useFm()

  return (
    <div className="relative text-text-primary w-full mx-auto mb-12 flex flex-col gap-4 mt-14 md:mt-[120px]">
      <h1 className="mx-auto text-2xl md:text-[40px] font-semibold">
        {t('fqa')}
      </h1>
      {[0, 1, 2, 3].map((item) => (
        <RulesItem title={t(`fqa-title-${item}`)} key={item}>
          <div className="text-sm font-normal mt-3">
            <p>{t(`fqa-content-${item}`)}</p>
          </div>
        </RulesItem>
      ))}
    </div>
  );
};
export default RulesView;
