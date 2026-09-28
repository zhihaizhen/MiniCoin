# Rules 规则组件

`Rules` 是一个用于展示活动规则或通用规则说明的 React 组件。它支持多种展示模式，并可以通过接口动态获取数据或传入静态规则数据。

## 特性

- **多种展示模式**：支持 `default` (列表), `collapse` (折叠), `collapseBorder` (带边框的折叠) 三种样式。
- **动态/静态数据**：可以通过 `campaignCode` 调用接口获取规则，也可以直接传入 `customRules`。
- **高度可定制**：支持自定义标题和内容的样式类（`titleClassName`, `contentClassName`）。
- **序号控制**：可控制是否显示规则序号。

## 用法

### 1. 基础用法 (通过活动代码获取数据)

```tsx
import { Rules } from '@better-bit-fe/base-ui';

const App = () => {
  return (
    <Rules 
      type="default" 
      campaignCode="CAMPAIGN_2024" 
    />
  );
};
```

### 2. 使用静态规则数据 (不请求接口)

```tsx
import { Rules } from '@better-bit-fe/base-ui';

const myRules = [
  {
    ruleTitle: '规则一',
    ruleOrder: 1,
    content: [
      { content: '这是规则一的详细内容。', contentOrder: 1 },
      { content: '这是规则一的补充内容。', contentOrder: 2 }
    ]
  },
  {
    ruleTitle: '规则二',
    ruleOrder: 2,
    content: [
      { content: '这是规则二的详细内容。', contentOrder: 1 }
    ]
  }
];

const App = () => {
  return (
    <Rules 
      type="collapse" 
      customRules={myRules} 
      showOrder={true}
    />
  );
};
```

### 3. 自定义样式

```tsx
<Rules 
  campaignCode="CAMPAIGN_2024"
  titleClassName="text-red-500 font-bold"
  contentClassName="text-gray-400 text-sm"
/>
```

## 参数说明 (Props)

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `type` | `'default' \| 'collapse' \| 'collapseBorder'` | `'default'` | 规则展示的样式模式。 |
| `campaignCode` | `string` | `''` | 活动代码，用于获取规则。如果设置了 `customRules`，此参数会被忽略。 |
| `customRules` | `RulesProps[] \| null` | `null` | 静态规则数据。如果传入此参数，将不再请求接口。 |
| `titleClassName` | `string` | `''` | 应用于规则标题（`ruleTitle`）的自定义类名。 |
| `contentClassName` | `string` | `''` | 应用于规则内容（`content`）的自定义类名。 |
| `showOrder` | `boolean` | `true` | 是否显示规则序号（例如 "1.", "2." 等）。 |

## 接口定义 (Interfaces)

### RulesProps
```typescript
interface RulesProps {
  ruleTitle: string;    // 规则标题
  ruleOrder: number;    // 规则排序序号
  content: ContentProps[]; // 规则下的具体内容条目
}
```

### ContentProps
```typescript
interface ContentProps {
  content: string;      // 内容文本
  contentOrder: number; // 内容排序序号
}
```
