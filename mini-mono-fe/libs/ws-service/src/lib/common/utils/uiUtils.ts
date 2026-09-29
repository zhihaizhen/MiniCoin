export enum OffsetType {
  both = 'both',
  offsetLeft = 'offsetLeft',
  offsetTop = 'offsetTop',
}
const maxDepth = 3;

function getOffsetFromParent(
  _element: HTMLElement,
  _parent?: HTMLElement,
  _offsetType = OffsetType.both,
) {
  const offsetTypeList =
    _offsetType === OffsetType.both
      ? [OffsetType.offsetLeft, OffsetType.offsetTop]
      : [_offsetType];
  const parent = _parent || document.body;
  let element = _element;
  const offset = {
    [OffsetType.offsetLeft]: 0,
    [OffsetType.offsetTop]: 0,
  };
  let depth = 0;
  while (element) {
    if (element === parent || depth > maxDepth) {
      break;
    }
    for (let i = 0; i < offsetTypeList.length; i += 1) {
      const offsetType = offsetTypeList[i];
      offset[offsetType] += element[offsetType];
    }
    element = element.offsetParent as HTMLElement;
    depth += 1;
  }
  return offset;
}

export function getOffsetTop(_element: HTMLElement, _parent?: HTMLElement) {
  const { offsetTop } = getOffsetFromParent(
    _element,
    _parent,
    OffsetType.offsetTop,
  );
  return offsetTop;
}

export function getOffsetLeft(_element: HTMLElement, _parent?: HTMLElement) {
  const { offsetLeft } = getOffsetFromParent(
    _element,
    _parent,
    OffsetType.offsetLeft,
  );
  return offsetLeft;
}
