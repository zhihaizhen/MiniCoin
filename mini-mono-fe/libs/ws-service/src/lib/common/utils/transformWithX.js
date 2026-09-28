import { transformNum } from '@unified/helpers';
import { isLinear } from '../utils/symbol';

export const transformWithX = (data) => {
  Object.keys(data).forEach((key) => {
    if (isLinear(data.symbol)) {
      if (key.endsWith('X')) {
        data[key] = transformNum(data[key], 1e8, 'div');
      }
    }
  });
  return data;
};
