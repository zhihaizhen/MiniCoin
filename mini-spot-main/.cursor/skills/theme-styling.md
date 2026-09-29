# 技能：主题样式开发

## 适用场景
- 组件样式改用主题 CSS 变量，替换掉硬编码色值
- 新增全局 Antd 组件样式覆盖
- 排查黑/白模式切换后样式异常（颜色不跟随主题）
- 了解 CSS 变量的定义位置（mini-common）vs 消费位置（本仓库）

---

## 关键：两层架构，分清边界

```
mini-common（CDN）         本仓库（mini-trade）
────────────────           ────────────────────
定义 CSS 变量               消费 CSS 变量
theme.dark.css             *.module.less
theme.light.css            antd-rewrite.less
color-var.css              common-cls.less
size-var.css
```

**本仓库的样式文件只能消费变量，不能定义新的设计 token。**
如需新增/修改 CSS 变量（如增加一个新的语义色），需改 `mini-common`，
然后等 CDN 发布后本仓库才能使用。

---

## 本仓库样式文件职责

| 文件 | 职责 | 修改场景 |
|------|------|----------|
| `common/assets/css/antd-rewrite.less` | Antd 组件全局主题覆盖 | 修改按钮/Slider/Tooltip 等全局样式 |
| `common/assets/css/common-cls.less` | 语义工具类（`.long`/`.short`/`.brand-color`）| 新增全局语义 class |
| `common/assets/css/global.less` | 滚动条、拖拽角标、全局链接色 | 修改全局布局级样式 |
| `common/antdComponents/*/index.less` | 各封装组件的 Antd 样式覆盖 | 修改特定封装组件的样式 |
| `containers/**/*.module.less` | 业务组件样式（CSS Modules）| 新增/修改某个业务组件样式 |

---

## 常用 CSS 变量速查

**文本色**
```less
var(--text-primary)           // 主要文本（最高对比度）
var(--text-secondary)         // 次要文本
var(--text-tertiary)          // 辅助/占位文本
var(--text-brand-default-web) // 品牌色文字（按钮、链接、高亮）
var(--text-white-to-black)    // 白/黑（主按钮文字，跟随主题反转）
```

**背景/填充色**
```less
var(--bg-primary)             // 页面主背景
var(--fill-fill-input)        // 输入框背景
var(--fill-fill-modal)        // 弹窗背景
var(--fill-fill-mask)         // 遮罩层
var(--fill-fill-tooltip-web)  // Tooltip 背景
var(--fill-fill-slider)       // Slider 轨道
```

**按钮**
```less
var(--fill-button-brand-default)       // 主按钮（品牌色）
var(--fill-button-brand-hover)         // 主按钮 hover
var(--fill-button-tertiary-default)    // 次要按钮
var(--fill-button-tertiary-hover)      // 次要按钮 hover
var(--fill-button-tertiary-press)      // 次要按钮 active
var(--fill-button-primary-disabled)    // 禁用按钮
```

**边框**
```less
var(--line-border-default)    // 默认边框
```

**涨跌色（语义色）**
```less
var(--long)  // 涨色（通过 .long 工具类或变量）
var(--short)  // 跌色（通过 .short 工具类或变量）
```

**中性色（用于选中高亮等）**
```less
var(--neutral-700)  // 文本选中背景色
```

---

## 场景 A：组件样式中使用变量（最常见）

```less
// containers/myFeature/MyPanel.module.less
.container {
  background: var(--bg-primary);
  border: 1px solid var(--line-border-default);
  border-radius: 8px;
}

.title {
  color: var(--text-primary);
  font-size: 14px;
}

.subtext {
  color: var(--text-secondary);
  font-size: 12px;
}

.activeItem {
  color: var(--text-brand-default-web);
}


```

---

## 场景 B：修改 Antd 全局组件样式

在 `common/assets/css/antd-rewrite.less` 中添加/修改：

```less
// 示例：给 Antd Tag 组件适配主题
.ant-tag {
  background: var(--fill-button-tertiary-default);
  color: var(--text-secondary);
  border: none;
  border-radius: 4px;
}

.ant-tag-success {
  background: transparent;
  color: var(--color-rise);
}
```

**注意**：`antd-rewrite.less` 全局生效，影响所有页面。
单个组件内需覆盖时，在 `*.module.less` 中用 `:global` 局部覆盖：

```less
// 局部覆盖（只影响当前组件内部的 Antd 元素）
.myWrapper {
  :global(.ant-btn-primary) {
    background: var(--fill-button-brand-default);
  }
}
```

---

## 场景 C：替换已有的硬编码色值

排查页面上某个元素在主题切换后颜色不变，定位后替换：

```less
// ❌ 发现硬编码（需替换）
.priceLabel {
  color: #87909F;
  background: #1E2026;
  border: 1px solid #2B3139;
}

// ✅ 替换为语义变量
.priceLabel {
  color: var(--text-secondary);
  background: var(--fill-fill-input);
  border: 1px solid var(--line-border-default);
}
```

如果不确定对应哪个变量，参考 `antd-rewrite.less` 中同类元素的用法，
或查看 `mini-common/base/css/theme.dark.css` 和 `theme.light.css` 了解变量含义。

---

## 场景 D：新增全局语义工具类

如需新增一个全局复用的语义 class，在 `common/assets/css/common-cls.less` 添加：

```less
// 示例：新增资金费率正负色
.funding-positive {
  color: var(--long);
}

.funding-negative {
  color: var(--short);
}
```

在 JSX 中直接使用 className（不需要 `styles.xxx`，是全局 class）：

```jsx
<span className={fundingRate > 0 ? 'funding-positive' : 'funding-negative'}>
  {fundingRate}%
</span>
```

---

## 排查：主题切换后颜色不跟随

1. 检查该元素样式是否写死了十六进制色值
2. 检查是否引入的是 SVG 图片（`<img src={icon}>`）而非 DOM 组件（见 `svg-theming.md`）
3. 检查 CSS 变量名拼写是否正确（变量名不存在时降级为 `undefined`，相当于无色）
4. 在浏览器 DevTools 中切换 `html[data-theme]` 属性，验证变量是否正确切换
