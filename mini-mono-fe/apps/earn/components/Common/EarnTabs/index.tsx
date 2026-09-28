import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';

const BASE_PATH = process.env.BASE_PATH || '';

const EarnTabs: React.FC = () => {
  const router = useRouter();
  const t = useFm();

  const items = useMemo(() => [
    {
      key: '/',
      label: t('earn.overview', '理财总览')
    },
    {
      key: '/savings',
      label: t('saving-title', '理财宝')
    },
    {
      key: '/simple',
      label: t('earn.simple', '简单赚币')
    },
    {
      key: '/onchain',
      label: t('earn.onchain', '链上赚币')
    },
    {
      key: '/vip-premier-wealth-hub',
      label: t('earn.vipwealth', 'VIP尊享财富管理')
    },
    {
      key: '/loan',
      label: t('earn.loan', '质押借币')
    }
  ], [t]);

  const activeKey = useMemo(() => {
    const pathname = router.pathname
    // Remove BASE_PATH from pathname for comparison
    const normalizedPathname = pathname.replace(BASE_PATH, '');
    if (normalizedPathname === '/' || normalizedPathname === '/index') return '/';
    if (normalizedPathname.startsWith('/savings')) return '/savings';
    if (normalizedPathname.startsWith('/simple')) return '/simple';
    if (normalizedPathname.startsWith('/onchain')) return '/onchain';
    if (normalizedPathname.startsWith('/vip-premier-wealth-hub')) return '/vip-premier-wealth-hub';
    if (normalizedPathname.startsWith('/loan')) return '/loan';
    return '/';
  }, [router.pathname]);

  const onChange = (key: string) => {
    router.push(`${BASE_PATH}${key}`);
  };

  return (
    <div className="flex gap-6 overflow-x-auto scrollbar-hide">
      {items.map((item) => {
        const isActive = activeKey === item.key;
        return (
          <div
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`cursor-pointer py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap shrink-0 ${
              isActive
                ? 'border-fill-button-brand-default text-text-brand-default'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

export default EarnTabs;
