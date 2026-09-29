// @ts-nocheck
import { getTmsMessages } from '@better-bit-fe/lang';
import { withLayout } from '@better-bit-fe/base-ui';
import { ProofOfReservesPage } from '../../components/proofOfReserves/ProofOfReservesPage';

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['footer', 'proofOfReserves', 'gitbook-url'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png',
      path: `/${locale}/proofOfReserves/`
    }
  };
};

export default withLayout(ProofOfReservesPage);
