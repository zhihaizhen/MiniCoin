// @ts-nocheck
import React, { memo, PropsWithChildren } from 'react';

interface Props {
  components: Array<React.ComponentType | (({ children }) => JSX.Element)>;
}

/**
 * @abstract 对传入组件自动做嵌套处理，主要用于多个Provider的情况
 *
 * @example
 * <NestedComponents
 *   components={[
 *     ({ children }) => <Comp1 id={1}>{children}</Comp1>,
 *     Comp2,
 *     Comp3,
 *   ]}
 * >inner</NestedComponents>
 *
 * 相当于
 * <Component1 id={1}>
 *   <Component2>
 *     <Component3>
 *       inner
 *     </Component3>
 *   </Component2>
 * </Component1>
 */

export const Nested = memo(function NestedComponents(
  props: PropsWithChildren<Props>
) {
  const { components, children } = props;

  return (
    <>
      {components.reduceRight((Prev, Curr) => {
        return <Curr>{Prev}</Curr>;
      }, children)}
    </>
  );
});

// export default memo(NestedComponents);
