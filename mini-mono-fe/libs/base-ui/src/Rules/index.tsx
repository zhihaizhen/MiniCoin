import React, { useEffect, useState } from 'react';
import DefaultRules from './default';
import { getCampaignDesc } from './api';
import { CollapseRules } from './collapse';
import { CollapseBorderRules } from './collapseBorder';
import SimpleRules from './simple';

export { getCampaignDesc };

export interface ContentProps {
  content: string;
  contentOrder: number;
}

export interface RulesProps {
  ruleTitle: string;
  ruleOrder: number;
  contents: ContentProps[];
}

export type RulesType = 'default' | 'simple' | 'collapse' | 'collapseBorder';

export interface RulesComponentProps {
  type?: RulesType;
  campaignCode?: string;
  customRules?: RulesProps[] | null;
  className?: string;
  headTitle?: string;
  headTitleClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  showOrder?: boolean;
  onLoad?: (res: any) => void;
}

const COMPONENT_MAP: Record<RulesType, React.ComponentType<any>> = {
  default: DefaultRules,
  collapse: CollapseRules,
  collapseBorder: CollapseBorderRules,
  simple: SimpleRules
};

export const formatRules = (rules: RulesProps[]) => {
  return (
    rules
      ?.map((rule: RulesProps) => ({
        ...rule,
        contents: rule.contents?.sort((a, b) => a.contentOrder - b.contentOrder),
      }))
      .sort((a, b) => a.ruleOrder - b.ruleOrder) || []
  );
};

export const Rules: React.FC<RulesComponentProps> = ({
  type = 'default',
  campaignCode = '',
  customRules = null,
  className = '',
  headTitle = '',
  headTitleClassName = '',
  titleClassName = '',
  contentClassName = '',
  showOrder = true,
  onLoad = null,
}) => {
  const [rules, setRules] = useState<RulesProps[]>([]);

  useEffect(() => {
    if (customRules) {
      setRules(formatRules(customRules));
      return;
    }
    if (!campaignCode) return;
    getCampaignDesc({ campaign_code: campaignCode }).then((res) => {
      if (!res) return;
      if (res.rules) {
        setRules(formatRules(res.rules));
      }
      if (onLoad) {
        onLoad(res);
      }
    });
  }, [campaignCode, customRules]);

  const SelectedRulesComponent = COMPONENT_MAP[type] || DefaultRules;

  return (
    <div className={`w-full ${className}`}>
      {headTitle && (
        <div className={`text-text-primary text-2xl md:text-3xl font-semibold mb-6 md:mb-8 ${headTitleClassName}`}>
          {headTitle}
        </div>
      )}
      <SelectedRulesComponent
        rules={rules}
        titleClassName={titleClassName}
        contentClassName={contentClassName}
        showOrder={showOrder}
      />
    </div>
  );
};
