import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as RightArrowIcon } from '~/public/images/right-arrow.svg';
import { Rules, RulesProps } from '@better-bit-fe/base-ui';

const TYPE_ITEMS: Record<string, { items: number[]; prefix: string }> = {
  simple: { items: [1, 2, 3, 4], prefix: 'simple-' },
  saving: { items: [0, 9, 1, 2, 3, 5, 6, 10, 11], prefix: '' },
  onchain: { items: [1, 2, 3, 4, 5, 6, 7, 8], prefix: 'onchain-' },
};

const buildContents = (keys: string[], t: (k: string) => string) =>
  keys.map((key, i) => ({ content: t(key), contentOrder: i + 1 }));

const buildRules = (items: number[], prefix: string, t: (k: string) => string): RulesProps[] =>
  items.map((item, index) => ({
    ruleOrder: index + 1,
    ruleTitle: t(`fqa-${prefix}title-${item}`),
    contents: [{ content: t(`fqa-${prefix}content-${item}`), contentOrder: 1 }],
  }));

const buildLoanRules = (t: (k: string) => string): RulesProps[] => [
  { ruleOrder: 1, ruleTitle: t('fqa-loan-title-1'), contents: buildContents(['fqa-loan-content-1'], t) },
  { ruleOrder: 2, ruleTitle: t('fqa-loan-title-2'), contents: buildContents(['fqa-loan-content-2'], t) },
  { ruleOrder: 3, ruleTitle: t('fqa-loan-title-3'), contents: buildContents(['fqa-loan-content-3-1', 'fqa-loan-content-3-2'], t) },
  { ruleOrder: 4, ruleTitle: t('fqa-loan-title-4'), contents: buildContents(['fqa-loan-content-4-1', 'fqa-loan-content-4-2', 'fqa-loan-content-4-3', 'fqa-loan-content-4-4'], t) },
  { ruleOrder: 5, ruleTitle: t('fqa-loan-title-5'), contents: buildContents(['fqa-loan-content-5-1', 'fqa-loan-content-5-2', 'fqa-loan-content-5-3', 'fqa-loan-content-5-4', 'fqa-loan-content-5-5', 'fqa-loan-content-5-6'], t) },
  { ruleOrder: 6, ruleTitle: t('fqa-loan-title-6'), contents: buildContents(['fqa-loan-content-6-1', 'fqa-loan-content-6-2', 'fqa-loan-content-6-3', 'fqa-loan-content-6-4'], t) },
];

const RulesView = ({ type }: { type: string }) => {
  const t = useFm();

  const getRules = (): RulesProps[] => {
    if (type === 'loan') return buildLoanRules(t);
    const config = TYPE_ITEMS[type];
    if (!config) return [];
    return buildRules(config.items, config.prefix, t);
  };

  return (
    <div className="relative text-text-primary w-full mx-auto flex flex-col mt-14 md:mt-20">
      <h1 className="mx-auto text-2xl md:text-[40px] font-semibold mb-6">{t('fqa')}</h1>
      <Rules type="collapse" customRules={getRules()} showOrder={false} />
      <div className="flex justify-center items-center text-sm text-text-brand-default-web mt-6 md:mt-10">
        <a
          className="cursor-pointer flex items-center gap-2 hover:text-fill-button-brand-hover group"
          href={t('earn-help') || 'https://easicoin.zendesk.com/hc/en-us/categories/14533067119631'}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('help-center')}
          <RightArrowIcon className="group-hover:translate-x-1.5 transition-all ease-in-out duration-300" />
        </a>
      </div>
    </div>
  );
};

export default RulesView;
