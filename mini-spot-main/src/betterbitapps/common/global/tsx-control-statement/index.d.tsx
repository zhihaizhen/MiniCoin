/**
 * 用作定义，以便过掉一些检查
 */

export function Choose(props: { children?: any }) {
  return props.children;
}

export function When(props: { children?: any; condition: any }) {
  return props.children;
}

export function If(props: { children?: any; condition: any }) {
  return props.children;
}

type NoBody<T> = {
  children?: any;
  each: string;
  of: Iterable<T>;
  index?: string;
};
type WithBody<T> = {
  children?: any;
  of: Iterable<T>;
  // eslint-disable-next-line no-unused-vars
  body: (x: T, index: number) => any;
};
export function For<T>(props: NoBody<T> | WithBody<T>) {
  return props.children;
}

export function Otherwise(props: { children?: any }) {
  return props.children;
}

export function With(props: { [id: string]: any }) {
  return props.children;
}
