import { position } from './private/position';
import { wallet } from './private/wallet';
import { closePnl } from './private/closePnl';
import { order } from './private/order';
import { notice } from './private/notice';
import { execution } from './private/execution';

export const linearModel = {
  position,
  wallet,
  order,
  notice,
  execution,
  closePnl,
};
