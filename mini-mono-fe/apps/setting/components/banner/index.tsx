// @ts-nocheck
import * as React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import Style from './index.module.less';

const Banner: React.FC = (props) => {
  const t = useFm();
  return <div className={Style.banner}>{t('page-title')}</div>;
};

export default Banner;
