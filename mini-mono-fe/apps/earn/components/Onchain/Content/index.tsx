import Rules from '~/components/Common/Rules';
import React from 'react';
import StaticSection from '~/components/Common/StaticSection';
import OnchainProductList from '~/components/Onchain/ProductList';

const OnchainContent: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto md:py-10 px-4 md:px-0">
      <OnchainProductList />
      <StaticSection />
      <Rules type='onchain' />
    </div>
  )
}

export default OnchainContent;
