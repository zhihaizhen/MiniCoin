

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as PlusIcon } from './icon/plus.svg';
import { ReactComponent as MinusIcon } from './icon/minus.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { RulesProps } from '@better-bit-fe/base-ui';


const RulesItem = ({title, children, titleClassName = ''}) => {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`w-full px-4 md:px-6 py-4 rounded-xl cursor-pointer border hover:border-line-border-hover
          ${collapsed ? "border-[#37393A]" : "bg-bg-secondary border-bg-secondary"}`} onClick={() => setCollapsed(!collapsed)}>

      <div className="w-full flex items-center justify-between">
        <span className={`flex-1 pr-2 text-base md:text-lg font-semibold text-white ${titleClassName}`}>{title}</span>
        <div className="w-4 h-4 md:w-5 md:h-5">
          {collapsed ? <MinusIcon /> : <PlusIcon />}
        </div>
      </div>

      { collapsed && children }

    </div>
  )
}
interface IProps {
  rules: RulesProps[];
  titleClassName?: string;
  contentClassName?: string;
  showOrder?: boolean;
}
export const CollapseBorderRules = ({ rules, titleClassName, contentClassName, showOrder = true }: IProps) => {
  const t = useFm()
  const pointClass = "before:content-[''] before:inline-block before:w-1 before:h-1 before:bg-[#666A6C] before:rounded-full before:mx-1 before:mb-[3px]"

  const hasHTag = (content: string) => {
    return /^<h[^>]*>/.test(content);
  };

  const shouldShowPoint = (content: string, totalLength: number) => {
    return totalLength > 1 && !hasHTag(content);
  };

  return (
    <div
      className="relative text-text-primary w-full mx-auto flex flex-col gap-4">
      {
        rules.map((rule, index) => {
          return (
            <RulesItem key={index} title={showOrder ? `${index + 1}. ${rule.ruleTitle}` : rule.ruleTitle} titleClassName={titleClassName}>
              <div className="text-sm font-normal text-text-secondary mt-3">
                <ul className="list-disc list-inside space-y-1 ">
                  {rule.contents?.map((item, index) => (
                    <li key={index} className={`${shouldShowPoint(item.content, rule.contents.length) ? pointClass : ''} ${contentClassName}`}>
                      <FormattedMessage
                        id="none"
                        defaultMessage={item?.content||''}
                        values={{
                          h: (chunks) => chunks
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </RulesItem>
          )
        })
      }
    </div>
  );
};
