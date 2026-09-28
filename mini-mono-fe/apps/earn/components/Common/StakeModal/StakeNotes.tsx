import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { FormattedMessage } from 'react-intl';
import { TagEnum } from '~/enums';

interface StakeNotesProps {
  productType: string;
  activeTab: 'notes' | 'rules';
  onTabChange: (tab: 'notes' | 'rules') => void;
}

const StakeNotes: React.FC<StakeNotesProps> = ({
  productType,
  activeTab,
  onTabChange
}) => {
  const t = useFm();

  if (productType !== TagEnum.DEFI) {
    return (
      <>
        <div className="flex justify-start items-center mt-2 font-bold">
          {t('stake-notes', '质押须知')}
        </div>
        <div className="text-text-secondary text-xs mt-2 text-justify">
          {t('stake-notes-content')}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-start items-center mt-3 gap-2">
        <div
          className={`cursor-pointer text-sm transition-all duration-300 ${
            activeTab === 'notes'
              ? 'text-text-primary font-bold'
              : 'text-text-secondary font-medium hover:text-text-primary'
          }`}
          onClick={() => onTabChange('notes')}
        >
          {t('stake-notes', '质押须知')}
        </div>
        <div
          className={`cursor-pointer text-sm transition-all duration-300 ${
            activeTab === 'rules'
              ? 'text-text-primary font-bold'
              : 'text-text-secondary font-medium'
          }`}
          onClick={() => onTabChange('rules')}
        >
          {t('product-rules', '产品规则')}
        </div>
      </div>

      <div className="text-text-secondary text-xs mt-2 text-justify max-h-30 overflow-y-auto">
        <FormattedMessage
          id={activeTab === 'rules' ? 'stake-defi-rules-content' : 'stake-defi-notes-content'}
          values={{
            b: (chunks: React.ReactNode) => <strong className="text-black font-medium">{chunks}</strong>,
            p: (chunks: React.ReactNode) => <p className="mb-1">{chunks}</p>
          }}
        />
      </div>
    </>
  );
};

export default StakeNotes;
