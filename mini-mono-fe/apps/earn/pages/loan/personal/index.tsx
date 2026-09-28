import React from 'react';
import { withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import LoanPageLayout from '~/components/Loan/LoanPageLayout';
import Personal from '~/components/Loan/Personal';

function Page() {
  return (
    <LoanPageLayout headerStyle="second">
      <Personal />
    </LoanPageLayout>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['earn', 'error_code', 'gitbook-url'],
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
      ogImage: '/static/image/ogImage.jpeg',
      path: `https://www.easicoin.io/${lc}/earn/savings/`
    }
  };
};

export default withLayout(Page);
