/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from 'react';
import { ICampaignInfo } from './types';

const LOG_PREFIX = '@better-bit-fe/base-provider/campaign-info';

interface IApiDataByCampaign {
  [campaignId: string]: {
    [dataName: string]: any; // value is the entire "result" returned from api response
  };
}
/**
 * React Context for CampaignInfo
 */
export const CampaignInfoContext = React.createContext({
  setCampaignById: (campaignId: string, newCampaignData: ICampaignInfo) => {
    return;
  },
  campaignsInfo: {},
  apiDataByCampaigns: {},
  setApiDataById: (campaignId: string, dataName: string, data: any) => {
    return;
  }
});
CampaignInfoContext.displayName = 'CampaignInfoContext';

/**
 * Custom React Context Provider for providing campaign related info
 * @param param0 Object props
 */
export const CampaignInfoProvider = ({ children }) => {
  const [campaignsInfo, setCampaignsInfo] = useState({});
  const [apiDataByCampaigns, setApiDataByCampaigns] =
    useState<IApiDataByCampaign>({});

  const setCampaignById = (
    campaignId: string,
    newCampaignData: ICampaignInfo
  ) => {
    console.log(
      `${LOG_PREFIX}:: set campaign ${campaignId} with ${JSON.stringify(
        newCampaignData
      )}`
    );

    return setCampaignsInfo((prev) => ({
      ...prev,
      [campaignId]: newCampaignData
    }));
  };

  const setApiDataById = (campaignId: string, dataName: string, data: any) => {
    console.log(
      `${LOG_PREFIX}:: set api data of campaign ${campaignId} with ${JSON.stringify(
        data
      )}`
    );

    return setApiDataByCampaigns((prev) => ({
      ...prev,
      [campaignId]: prev[campaignId]
        ? { ...prev[campaignId], [dataName]: data }
        : { [dataName]: data }
    }));
  };

  return (
    // @ts-ignore
    <CampaignInfoContext.Provider
      value={{
        setCampaignById,
        campaignsInfo,
        apiDataByCampaigns,
        setApiDataById
      }}
    >
      {children}
    </CampaignInfoContext.Provider>
  );
};

export default CampaignInfoContext;

export const useCampaignInfo = () => {
  return useContext(CampaignInfoContext);
};
