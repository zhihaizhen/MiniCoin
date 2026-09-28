import { useRouter } from 'next/router';
import { withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { SpotQuoteTokenProvider } from 'libs/ws-service';
import { DcaDetail } from './dcaDetail';
import { StrategyDetails as GridDetail } from './gridDetail';

function DetailsPage() {
  const router = useRouter();
  const { type } = router.query;

  return (
    <SpotQuoteTokenProvider useTickersWs>
      {type === 'dca' ? <DcaDetail /> : <GridDetail />}
    </SpotQuoteTokenProvider>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['trading-bot', 'error_code', 'gitbook-url',],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages['strategy-details'] || 'Strategy Details',
      description: messages['strategy-details-desc'] || 'View strategy details',
      ogImage: '/static/image/ogImage.jpeg',
      path: `https://www.easicoin.io/${lc}/trading-bot/details`
    }
  };
};

export default withLayout(DetailsPage);
