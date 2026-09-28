// 匹配灰度切量结果
export const getAbResult = (currentUid, currentCoin, abConfig = {}) => {
  const keysArr = Object.keys(abConfig);
  const abResult = {};
  const lastUid = Number(String(currentUid).slice(-1));
  keysArr.forEach((key) => {
    const uidConfigArr = abConfig[key][currentCoin] || [];
    abResult[key] =
      uidConfigArr.includes(lastUid) || uidConfigArr.includes('all');
  });
  return abResult;
};