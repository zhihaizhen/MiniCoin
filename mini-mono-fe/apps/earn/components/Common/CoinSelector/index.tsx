import React from 'react';
import { Dropdown, type MenuProps } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as EyeOpenIcon } from '~/public/images/eye-open.svg';
import { ReactComponent as EyeCloseIcon } from '~/public/images/eye-close.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/images/arrow-down.svg';
import { ReactComponent as RightArrowIcon } from '~/public/images/right-arrow.svg';

interface CoinSelectorProps {
  selectCoin: string;
  handleSelectAsset: MenuProps['onClick'];
  showAssets: boolean;
  isHideEye?: boolean;
  setShowAssets: (show: boolean) => void;
}

const COIN_DROPDOWN_OPTIONS = [
  { label: 'BTC', value: 'BTC' },
  { label: 'USDT', value: 'USDT' },
  { label: 'more', value: 'more' }
];

const CoinSelector: React.FC<CoinSelectorProps> = ({
  selectCoin,
  handleSelectAsset,
  showAssets,
  setShowAssets,
  isHideEye
}) => {
  const t = useFm();

  return (
    <>
      <span>{`(${selectCoin})`}</span>
      <Dropdown
        placement="bottomLeft"
        overlayClassName="coin-dropdown-overlay"
        menu={{
          items: COIN_DROPDOWN_OPTIONS.map((item) => ({
            label: (
              <div className="flex justify-start items-center gap-2 text-xs py-1 min-w-[76px]">
                <span>{t(item.label)}</span>
                {item.value === 'more' && <RightArrowIcon />}
              </div>
            ),
            key: item.value
          })),
          selectable: true,
          selectedKeys: [selectCoin],
          onClick: handleSelectAsset
        }}
        trigger={['click']}
      >
        <div className="cursor-pointer text-base ml-0.5">
          <ArrowDownIcon />
        </div>
      </Dropdown>
      {!isHideEye &&
        <div
          className="cursor-pointer text-base ml-1.5"
          onClick={() => setShowAssets(!showAssets)}
        >
          {showAssets ? <EyeOpenIcon /> : <EyeCloseIcon />}
        </div>
      }
    </>
  );
};

export default CoinSelector;
