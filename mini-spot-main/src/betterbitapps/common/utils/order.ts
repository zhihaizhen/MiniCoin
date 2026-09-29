import { USER_SETTINGS } from 'common/packages-biz/global-settings';
import { toNumberZero } from './utils';

export const hidePreCreateSave = (doubleConfirmData: any) =>
  (doubleConfirmData || '')
    .split(USER_SETTINGS.ORDER_CONFIRM)
    .join('')
    .split(',')
    .filter((val: any) => val);

export const handleX = (val: number, symbol: string) => {
  return toNumberZero(val / 1e8);
};


