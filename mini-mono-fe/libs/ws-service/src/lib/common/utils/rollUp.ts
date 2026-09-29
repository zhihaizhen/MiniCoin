import { getOffsetTop } from './uiUtils';

const NIL = () => {};

interface IRollUpProps {
  container: HTMLElement | undefined;
  during?: number;
  itemClass: string;
  moveTime?: number;
  groupCnt?: number;
  minLength?: number;
  stepCallBack?: (idx: number) => void;
}

export function rollUp({
  container,
  during = 4000,
  itemClass,
  moveTime = 1000,
  groupCnt = 1,
  minLength = 2,
  stepCallBack,
}: IRollUpProps): typeof NIL {
  if (!container) {
    return NIL;
  }
  const viewItemList = container.querySelectorAll<HTMLElement>(itemClass);
  const { length } = viewItemList;
  let current = 0;
  if (length < minLength) {
    return NIL;
  }
  let handler: NodeJS.Timeout;
  styleWebkitWrap({ container, attr: 'transform', value: `translateY(0)` });
  let baseOffsetTop = getOffsetTop(viewItemList[0], container);
  const step = () => {
    if (stepCallBack) {
      stepCallBack(current);
    }
    handler = setTimeout(() => {
      const block = () => {
        const next = viewItemList[current + 1];
        const offsetTop = getOffsetTop(next, container) - baseOffsetTop;
        styleWebkitWrap({
          container,
          attr: 'transition',
          value: `all ${moveTime / 1000}s ease-in-out`,
        });
        styleWebkitWrap({
          container,
          attr: 'transform',
          value: `translateY(-${offsetTop}px)`,
        });
        current += 1;
        step();
      };

      if (current === length - groupCnt) {
        current = 0;
        styleWebkitWrap({ container, attr: 'transition', value: 'none' });
        styleWebkitWrap({
          container,
          attr: 'transform',
          value: `translateY(0)`,
        });
        setTimeout(() => {
          block();
        }, 500);
      } else {
        block();
      }
    }, during);
  };
  setTimeout(() => {
    baseOffsetTop = getOffsetTop(viewItemList[0], container);
    step();
  }, 1000);
  return () => {
    clearTimeout(handler);
  };
}

function styleWebkitWrap({
  container,
  attr,
  value,
}: {
  container: HTMLElement;
  attr: string;
  value: string;
}) {
  container.style[attr] = value;
  container.style[`-webkit-${attr}`] = value;
}
