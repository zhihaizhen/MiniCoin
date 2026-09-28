import { isLinear } from '../utils/symbol';
import { linearModel } from './linear';
import { reverseModel } from './reverse';

export { linearModel } from './linear';
export { reverseModel } from './reverse';

export const tradeModel = (symbol) =>
  isLinear(symbol) ? linearModel : reverseModel;
