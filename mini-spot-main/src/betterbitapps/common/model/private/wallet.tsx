
interface IFOWallet {
  tokenName: string
  tokenId: string 
  total: number
  free: number
}

export const initWalletState = {
  tokenName: '',
  tokenId: '' ,
  total: 0,
  free: 0,
};

export const wallet = (data = initWalletState): IFOWallet => ({
  ...data,
  tokenName: data.tokenName,
  tokenId: data.tokenId,
  total: data.total,
  free: data.free,
});
