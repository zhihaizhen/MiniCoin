import { POSITION_IDX } from '../common/packages-biz/by-global-settings';

export const getRealTimePosition = (state) => {
  const positionList = state?.position?.positionList?.list ?? [];
  const poz = positionList.find(({ symbol }) => symbol === state.symbol);
  const longPoz = positionList.find(
    ({ symbol, positionIdx }) =>
      symbol === state.symbol && positionIdx === POSITION_IDX.LONG
  );
  const shortPoz = positionList.find(
    ({ symbol, positionIdx }) =>
      symbol === state.symbol && positionIdx === POSITION_IDX.SHORT
  );
  return {
    poz,
    longPoz,
    shortPoz,
    positionList
  };
};
