import { toNumberZero } from '../../../utils/utils';

interface INTERFACE_OUTPUT_CLOSEPNL {
  symbol: string;
  side: string;
  id: string;
  orderId: string;
  execType: string;
  closedSize: number;
  avgEntryPrice: number;
  avgExitPrice: number;
  updatedAt: number;
  createdAt: number;
  closedPnl: number;
  orderPrice: number;
}

interface INTERFACE_INPUT_CLOSEPNL {
  symbol: string;
  side: string;
  id: string;
  orderId: string;
  execType: string;
  cumClosedSizeX: string;
  avgEntryPrice: string;
  avgExitPrice: string;
  updatedAtE3: string;
  createdAtE3: string;
  cumClosedPnlE8: string;
  orderPrice: string;
}
const initState = {
  symbol: '',
  side: '',
  id: '',
  orderId: '',
  execType: '',
  cumClosedSizeX: '',
  avgEntryPrice: '',
  avgExitPrice: '',
  updatedAtE3: '',
  createdAtE3: '',
  cumClosedPnlE8: '',
  orderPrice: ''
};

export const closePnl = (
  data: INTERFACE_INPUT_CLOSEPNL = initState
): INTERFACE_OUTPUT_CLOSEPNL => {
  const { id, symbol, side, orderId, execType } = data;
  return {
    symbol,
    side,
    id,
    orderId,
    execType,
    closedSize: toNumberZero(data.cumClosedSizeX) / 1e8,
    avgEntryPrice: toNumberZero(data.avgEntryPrice),
    avgExitPrice: toNumberZero(data.avgExitPrice),
    updatedAt: toNumberZero(data.updatedAtE3),
    createdAt: toNumberZero(data.createdAtE3),
    closedPnl: toNumberZero(data.cumClosedPnlE8) / 1e8,
    orderPrice: toNumberZero(data.orderPrice)
  };
};
