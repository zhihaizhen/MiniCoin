import Broadcast from '~/components/Common/Broadcast';
import FeaturedSection from '~/components/Common/FeaturedSection';
import OverviewProductList from '~/components/Overview/ProductList';
import Rules from '~/components/Common/Rules';
import React from 'react';

const OverviewContent: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto md:py-10 px-4 md:px-0">
      <Broadcast />
      <FeaturedSection />
      <OverviewProductList />
      <Rules type='saving' />
    </div>
  )
}

export default OverviewContent;
