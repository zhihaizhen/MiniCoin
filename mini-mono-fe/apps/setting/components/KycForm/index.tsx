import React, { useState, useEffect } from 'react';
import { getKycInfo } from '~/api';
import BasicKycForm from './BasicKycForm';
import AdvancedKycForm from './AdvancedKycForm';
import type { IKycData } from '~/types';

interface KycFormProps {
  kycType?: 'basic' | 'advanced';
  onSubmitSuccess?: () => void;
}

const KycForm: React.FC<KycFormProps> = ({ kycType = 'basic', onSubmitSuccess }) => {
  const [kycData, setKycData] = useState<IKycData>({
    kyc_status: 'unknown'
  });
  const [isLoadingKycData, setIsLoadingKycData] = useState(true);

  const fetchKycInfo = async () => {
    setIsLoadingKycData(true);
    try {
      const res = await getKycInfo({});
      if (res) {
        setKycData(res);
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

  const handleSubmitSuccess = async () => {
    await fetchKycInfo();
    onSubmitSuccess?.();
  };

  if (isLoadingKycData) {
    return null;
  }

  // 根据 kycType 渲染不同的表单
  if (kycType === 'advanced') {
    return (
      <AdvancedKycForm
        kycData={kycData}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  return (
    <BasicKycForm
      kycData={kycData}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};

export default KycForm;

