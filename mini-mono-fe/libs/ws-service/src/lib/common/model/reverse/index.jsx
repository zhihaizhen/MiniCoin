import { closedPnl } from './private/closedPnl';
import { createPost } from './private/createPost';
import { execution } from './private/execution';
import { notice } from './private/notice';
import { order } from './private/order';
import { position } from './private/position';
import { preCreatePost } from './private/preCreatePost';
import { replacePost } from './private/replacePost';
import { riskLimit } from './private/riskLimit';
import { setProfitPost } from './private/setProfitPost';

export const reverseModel = {
  position,
  order,
  notice,
  execution,
  preCreatePost,
  createPost,
  setProfitPost,
  replacePost,
  closedPnl,
  riskLimit,
};
