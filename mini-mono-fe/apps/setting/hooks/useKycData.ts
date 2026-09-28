import { useState, useEffect } from 'react';
import { getKycInfo, getKycImg } from '~/api';
import type { ImageState } from './useKycImageUpload';

export interface KycData {
  status?: number | null;
  kyc_status?: 'unknown' | 'pending' | 'passed' | 'rejected';
  country?: string;
  first_name?: string;
  last_name?: string;
  identity_type?: string;
  identity_number?: string;
  dob?: string;
  identity_front?: string;
  identity_back?: string;
  identity_person?: string;
  reject_reason?: string;
  [key: string]: any;
}

interface UseKycDataParams {
  form: any;
  setIdFrontState: React.Dispatch<React.SetStateAction<ImageState>>;
  setIdBackState: React.Dispatch<React.SetStateAction<ImageState>>;
  setHandheldState: React.Dispatch<React.SetStateAction<ImageState>>;
}

export const useKycData = ({
  form,
  setIdFrontState,
  setIdBackState,
  setHandheldState
}: UseKycDataParams) => {
  const [kycData, setKycData] = useState<KycData>({});
  const [isLoadingKycData, setIsLoadingKycData] = useState(true);

  const fetchKycInfo = async () => {
    setIsLoadingKycData(true);
    try {
      const res = await getKycInfo({});
      if (res) {
        const { identity_front, identity_back, identity_person } = res;
        setKycData(res);

        if (identity_front || identity_back || identity_person) {
          const [frontImg, backImg, personImg] = await Promise.all([
            getKycImg({ file_path: identity_front }),
            getKycImg({ file_path: identity_back }),
            getKycImg({ file_path: identity_person })
          ]);

          if (identity_front) {
            setIdFrontState((prev) => ({
              ...prev,
              serverPath: identity_front,
              preview: frontImg
            }));
            form.setFieldValue('identity_front', identity_front);
          }

          if (identity_back) {
            setIdBackState((prev) => ({
              ...prev,
              serverPath: identity_back,
              preview: backImg
            }));
            form.setFieldValue('identity_back', identity_back);
          }

          if (identity_person) {
            setHandheldState((prev) => ({
              ...prev,
              serverPath: identity_person,
              preview: personImg
            }));
            form.setFieldValue('identity_person', identity_person);
          }
        }
      }
    } catch (error) {
      console.error('获取KYC信息失败:', error);
    } finally {
      setIsLoadingKycData(false);
    }
  };

  useEffect(() => {
    fetchKycInfo();
  }, []);

  return { kycData, isLoadingKycData, refetchKycInfo: fetchKycInfo };
};
