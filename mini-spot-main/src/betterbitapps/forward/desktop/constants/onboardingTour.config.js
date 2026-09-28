/**
 * Onboarding_Tour 引导内容配置（现货 · 五步）
 *
 * Coachmark 本体在 common/components/Coachmark/，本文件只负责 steps。
 * 文案对齐 Figma：step3 27705:57021 / step4 27705:57015 / step5 27705:44694
 *
 * @param {Function} t i18next t（defaultNS=spot）
 */
export const getOnboardingTourSteps = (t) => [
  {
    targetSelector: '[data-coachmark-step="symbol-select"]',
    title: t('onboardingStepSymbolTitle', { defaultValue: '选择交易对' }),
    description: t('onboardingStepSymbolDesc', {
      defaultValue: '点击此处搜索或切换交易对',
    }),
  },
  {
    targetSelector: '[data-coachmark-step="order-qty"]',
    title: t('onboardingStepOrderQtyTitle', { defaultValue: '输入订单数量' }),
    description: t('onboardingStepOrderQtyDesc', {
      defaultValue: '在此处输入买入或卖出的数量或金额',
    }),
    arrowAlign: 'end',
  },
  {
    targetSelector: '[data-coachmark-step="available-balance"]',
    title: t('onboardingStepBalanceTitle', { defaultValue: '查看可用余额' }),
    description: t('onboardingStepBalanceDesc', {
      defaultValue: '您可通过点击“+”按钮快速划转，增加可用余额',
    }),
    // Figma 27705:57021：beak 贴右
    arrowAlign: 'end',
  },
  {
    targetSelector: '[data-coachmark-step="order-tabs"]',
    title: t('onboardingStepOrderTabsTitle', {
      defaultValue: '查看当前委托、历史委托与成交明细',
    }),
    description: t('onboardingStepOrderTabsDesc', {
      defaultValue:
        '在此查看当前委托订单，或切换查看历史委托与成交明细的执行情况',
    }),
    // Figma 27705:57015：beak 贴左
    arrowAlign: 'start',
    // target 左边贴容器边界，高亮框左边内缩 12px 与卡片左边对齐
    highlightInsetLeft: 12,
  },
  {
    targetSelector: '[data-coachmark-step="setting-icon"]',
    title: t('onboardingStepSettingTitle', {
      defaultValue: '常用功能和交易设置',
    }),
    description: t('onboardingStepSettingDesc', {
      defaultValue: '在此查看更多交易工具，并进行交易设置',
    }),
    // Figma 27705:44694：beak 贴右，完成按钮为文案
    arrowAlign: 'end',
  },
];
