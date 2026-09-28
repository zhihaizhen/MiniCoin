import { EOrderSide, EOrderType } from 'common/enums/order.enum';
import { IOrderInfo } from 'common/types/order';
import { toNumberZero } from 'common/utils/utils';

interface IProps {
  order: IOrderInfo;
  conditionType: EOrderType;
  bid1Price: number;
  ask1Price: number;
}

export const getOrderCurrentPrices = ({
  order,
  conditionType,
  bid1Price,
  ask1Price,
}: IProps) => {
  return {
    longPrice: getCurrentPrice({
      order,
      conditionType,
      bid1Price,
      ask1Price,
      side: EOrderSide.Buy,
    }),
    shortPrice: getCurrentPrice({
      order,
      conditionType,
      bid1Price,
      ask1Price,
      side: EOrderSide.Sell,
    }),
  };
};

interface IPriceProps extends IProps {
  side: EOrderSide;
}
const getCurrentPrice = ({
  order,
  conditionType,
  bid1Price,
  ask1Price,
  side,
}: IPriceProps) => {
  // 条件单
  if (order.orderType === EOrderType.Condition) {
    return conditionType === EOrderType.Limit
      ? order.price
      : order.triggerPrice;
  }
  // 市价单
  if (order.orderType === EOrderType.Market) {
    return {
      [EOrderSide.Sell]: bid1Price,
      [EOrderSide.Buy]: ask1Price,
    }[side];
  }

  // 限价单
  if (side === EOrderSide.Sell && toNumberZero(order.price) < bid1Price) {
    return bid1Price;
  }

  if (side === EOrderSide.Buy && toNumberZero(order.price) > ask1Price) {
    return ask1Price;
  }

  return order.price;
};
