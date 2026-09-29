import { useCallback, useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { getQuoteTokens } from '../api';

interface QuoteToken {
  [key: string]: any;
}

function useQuoteTokens() {
  const [quoteTokens, setQuoteTokens] = useState<QuoteToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchQuoteTokens = useCallback(async () => {
    if (loaded) return;
    
    setLoading(true);
    try {
      const res = await getQuoteTokens({});
      if (res && Array.isArray(res)) {
        setQuoteTokens(res);
        setLoaded(true);
      }
    } catch (error) {
      console.error('获取 quote tokens 失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loaded]);

  return {
    quoteTokens,
    loading,
    loaded,
    fetchQuoteTokens
  };
}

export const QuoteTokensStore = createContainer(useQuoteTokens);
export const QuoteTokensProvider = QuoteTokensStore.Provider;
