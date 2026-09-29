import { useEffect } from 'react';
import { QuoteTokensStore } from '~/store/QuoteTokens';

/**
 * QuoteTokens 初始化组件
 * 在应用启动时自动调用接口获取 quote tokens 数据
 */
export const QuoteTokensInitializer: React.FC = () => {
  const { fetchQuoteTokens } = QuoteTokensStore.useContainer();

  useEffect(() => {
    fetchQuoteTokens();
  }, [fetchQuoteTokens]);

  return null;
};
