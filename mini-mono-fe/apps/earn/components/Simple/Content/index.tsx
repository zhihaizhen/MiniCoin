import Rules from '~/components/Common/Rules';
import React from 'react';
import SimpleProductList from '~/components/Simple/ProductList';

const SimpleContent: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto py-6 md:py-10 px-4 md:px-0">
      <SimpleProductList />
      <Rules type='simple' />
    </div>
  )
}

export default SimpleContent;
