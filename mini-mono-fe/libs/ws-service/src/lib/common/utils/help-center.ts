import { Env } from '@region-lib/env';

const { HELP_HOST } = Env;

export const getRiskLimitArticleUSDT = (language: string) => {
  return `${HELP_HOST}/${language}/article/1368`;
};

export const getRiskLimitArticleInverse = (language: string) => {
  return `${HELP_HOST}/${language}/article/1375`;
};

export const getLiqPriceArticleUSDT = (language: string) => {
  return `${HELP_HOST}/${language}/article/1314`;
};

export const getLiqPriceArticleInverse = (language: string) => {
  return `${HELP_HOST}/${language}/article/1331`;
};

export const getMarkPriceArticle = (language: string) => {
  return `${HELP_HOST}/${language}/article/1330`;
};
