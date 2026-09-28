import { execution } from './private/execution';
import { notice } from './private/notice';
import { order } from './private/order';
import { position } from './private/position';
import { replacePost } from './private/replacePost';
import { wallet } from './private/wallet';
import { symbol } from './private/symbol';

export  const  Model = {
  position,
  order,
  notice,
  execution,
  replacePost,
  wallet,
  symbol,
};
