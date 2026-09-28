# 技能：Antd 封装组件扩展

## 适用场景
- 给 `common/antdComponents/` 中的封装组件新增 props 或功能
- 新增一个 Antd 组件的二次封装
- 修改 Antd 组件的主题样式（颜色、圆角、间距等）
- 排查封装组件与 Antd 原生组件的行为差异

---

## 核心约定（必须遵守）

### onChange 双参数约定

所有封装组件的 `onChange` 统一传 `(value, name)` 两个参数，与下单表单的 `handleFormChange` 配合：

```jsx
// ✅ 正确：封装组件内部统一转换
const handleChange = (val) => {
  onChange?.(val, name);  // name 来自 props
};

// ❌ 禁止：直接透传 Antd 的 onChange（只有 value 一个参数）
<AntdInputNumber onChange={onChange} />
```

### 样式覆盖必须用 CSS 变量

```less
// ✅ 正确：跟随主题
.ant-input-number {
  background-color: var(--fill-fill-input);
  color: var(--text-primary);
  border-color: var(--text-brand-default-web);
}

// ❌ 禁止：写死色值
.ant-input-number {
  background-color: #1e2026;
  color: #ffffff;
}
```

### 引入封装组件，禁止直接用 antd

```js
// ✅ 正确
import { InputNumber, Modal, Select } from 'common/antdComponents';

// ❌ 禁止（跳过了键盘过滤、主题覆盖等封装逻辑）
import { InputNumber } from 'antd';
```

---

## 现有封装组件一览

| 组件 | 路径 | 核心扩展点 |
|------|------|-----------|
| `InputNumber` | `InputNumber/index.jsx` | 键盘过滤、精度控制、`enterNegative`、双参 `onChange` |
| `Input` | `Input/index.jsx` | 主题样式统一 |
| `Select` | `Select/index.jsx` | 主题样式统一 |
| `Modal` | `Modal/index.jsx` | 主题样式统一 |
| `Checkbox` | `Checkbox/index.jsx` | 主题样式统一 |
| `Switch` | `Switch/index.jsx` | 主题样式统一 |
| `Card` | `Card/index.jsx` | 主题样式统一 |
| `toast / message / notify` | `Toast/` | 全局通知，配合 `MessageContainer` / `NotifyContainer` 使用 |

---

## 场景 A：给 InputNumber 新增 props

`InputNumber` 是最复杂的封装组件，关键 props：

```jsx
<InputNumber
  value={price}
  name="price"                  // 必传：双参 onChange 需要
  precision={priceDecimalPlaces} // 精度（小数位数）
  enterNegative={false}          // 是否允许输入负号
  textAlign="center"             // 居中输入（可选）
  onChange={handleFormChange}    // (value, name) => void
/>
```

**键盘过滤逻辑（`InputNumber/index.jsx` 中 `handleKeyDown`）：**
- `precision === 0`：只允许整数输入
- 超出精度位数后，小数区域禁止继续输入
- `enterNegative={true}`：开放负号（keyCode 189/109）
- Ctrl/Meta 快捷键（复制、全选等）始终放行

**新增 prop 示例：**
```jsx
// 在 index.jsx 的 props 解构中新增
const { enterNegative, precision, className, textAlign,
        onKeyDown, value, onChange, name,
        maxDecimalLen,  // 新增：动态最大小数位
        children, ...others } = props;
```

---

## 场景 B：新增一个封装组件

以新增 `DatePicker` 为例：

**Step 1：创建文件**
```
common/antdComponents/DatePicker/
├── index.jsx   # 封装组件
└── index.less  # 主题样式覆盖
```

**Step 2：实现封装组件**
```jsx
// DatePicker/index.jsx
import { DatePicker as AntdDatePicker } from 'antd';
import React from 'react';
import './index.less';

export const DatePicker = ({ onChange, name, ...others }) => {
  const handleChange = (date, dateString) => {
    onChange?.(dateString, name);  // 保持双参约定
  };

  return <AntdDatePicker onChange={handleChange} {...others} />;
};
```

**Step 3：样式覆盖（`index.less`）**
```less
// 所有颜色必须用 CSS 变量
.ant-picker {
  background-color: var(--fill-fill-input);
  border-color: transparent;
  border-radius: 8px;

  .ant-picker-input > input {
    color: var(--text-primary);
    font-size: 14px;
  }

  .ant-picker-suffix {
    color: var(--text-tertiary);
  }
}

.ant-picker:hover,
.ant-picker-focused {
  border-color: var(--text-brand-default-web);
  box-shadow: none;
}
```

**Step 4：注册到统一导出**
```js
// common/antdComponents/index.js
export { DatePicker } from './DatePicker';
```

---

## 场景 C：修改全局 Antd 主题覆盖

需要修改某个 Antd 组件的全局样式（如按钮、Slider、Tooltip），
在 `common/assets/css/antd-rewrite.less` 中添加：

```less
// 示例：修改 Tooltip 圆角
.ant-tooltip {
  .ant-tooltip-inner {
    border-radius: 8px;  // 从 12px 改为 8px
    background: var(--fill-fill-tooltip-web);
    font-size: 12px;
  }
}
```

**注意**：`antd-rewrite.less` 是全局生效的，修改会影响所有页面。
组件级别的样式差异请放在各 `*.module.less` 中用 `:global` 覆盖。

---

## 场景 D：Toast / 通知使用

```jsx
import { toast, message, notify } from 'common/antdComponents';

// 简单提示
toast.success('下单成功');
toast.error('余额不足');

// message（顶部居中）
message.success('操作成功');
message.error('操作失败');

// notify（右侧通知）
notify.success({ title: '成交通知', content: '买入 0.01 BTC' });
```

确保 `<MessageContainer />` 和 `<NotifyContainer />` 已在 `App.jsx` 中挂载。

---

## 跨仓库同步

`common/antdComponents/` 在三个仓库中**结构相同**，修改后需同步：

```bash
# 同步到 mini-spot
cp common/antdComponents/InputNumber/index.jsx \
   /Users/jrjljf/Documents/run/mini-spot/src/betterbitapps/common/antdComponents/InputNumber/index.jsx

# 同步到 mini-cfdtrade
cp common/antdComponents/InputNumber/index.jsx \
   /Users/jrjljf/Documents/run/mini-cfdtrade/src/betterbitapps/common/antdComponents/InputNumber/index.jsx
```

同步前先用 `diff` 检查是否有各仓库特有的改动，详见 `cross-repo-sync.md`。
