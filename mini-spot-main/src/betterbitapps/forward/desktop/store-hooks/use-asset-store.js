import { useGlobalState } from '@/store';
import useUserStore from '@/store-hooks/use-user-store';

const useAssetStore = (symbol) => {
  const [globalState] = useGlobalState();
  const { assetOptionList } = globalState;
  const { wallet } = useUserStore();

  const allRes = {};

  // 资产币种
  assetOptionList.forEach((p) => {
    const wc = p.value;
    if (!allRes[wc]) {
      const { free } = wallet?.[wc] || {};
      const avaliableAsset = Math.max(0, free)
      allRes[wc] = { avaliableAsset };
    }
  });
  return allRes;
};

export default useAssetStore;
