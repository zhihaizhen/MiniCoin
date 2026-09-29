export default function useTrackingParams({
 
  isWalletCoinMode,
  typeValue,
  qtyValue,
}) {
  let option_qty_type = 3;
  const option_qty_type_value = String(typeValue);

  if (isWalletCoinMode) option_qty_type = 2;
  if ( !isWalletCoinMode) option_qty_type = 1;
  const option_qty_percent_value_e2 = Math.floor(qtyValue * 10000);
  return {
    option_qty_type,
    option_qty_type_value,
    option_qty_percent_value_e2,
  };
}
