import { IUser } from './user';

export interface IGlobalState {
  symbol: string;
  symbolName: string;
  user: IUser;
  coin: string;
  baseCurrency: string;
}
