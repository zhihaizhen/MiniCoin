//  @ts-nocheck
import { useState } from 'react';
import { getOverviewCardDataSev, getCommissionCardDataSev } from '~/api';

const useDashboard = () => {
  const [overviewCardData, setOverviewCardData] = useState({});
  const [commissionCardData, setCommissionCardData] = useState({});

  const getOverviewCardData = async (params) => {
    try {
      const res = await getOverviewCardDataSev(params);
      console.log(res, 'overview card data');
      setOverviewCardData(res);
    } catch (e) {
      console.warn(e);
    }
  };

  const getCommissionCardData = async (params) => {
    try {
      const res = await getCommissionCardDataSev(params);
      console.log(res, 'Commission card data');
      setCommissionCardData(res);
    } catch (e) {
      console.warn(e);
    }
  };

  return {
    overviewCardData,
    commissionCardData,
    getOverviewCardData,
    getCommissionCardData
  };
};

export default useDashboard;
