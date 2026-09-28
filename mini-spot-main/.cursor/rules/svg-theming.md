---
description: SVG 文件色值规范与 JSX 引入方式，确保黑白主题切换正常
globs: ["**/*.svg", "**/*.jsx", "**/*.tsx"]
alwaysApply: false
---

# SVG 主题适配规范

本项目有黑/白模式切换，SVG 中的色值必须跟随主题变化，**禁止硬编码十六进制颜色**。

## SVG 文件：禁止硬编码色值

```svg
<!-- ❌ 禁止：写死色值，无法跟随主题 -->
<path fill="#87909F" d="..." />
<path stroke="#1E2026" d="..." />
<circle fill="#FFFFFF" />

<!-- ✅ 必须：使用 currentColor，由 CSS 控制颜色 -->
<path fill="currentColor" d="..." />
<path stroke="currentColor" d="..." />
```

**规则：**
- `fill`、`stroke` 一律使用 `currentColor`
- 若某个形状不需要颜色（透明/镂空），使用 `fill="none"`
- **不要**在 SVG 内部写 `<style>` 标签或内联 `style` 属性设置颜色

## JSX 引入方式：必须以独立 SVG 文件 + ReactComponent 引入

**禁止在 JSX/TSX 里手写内联 `<svg>...</svg>`**（含组件内临时定义的 Icon 函数）。图标一律落在 `common/assets/images/`（或业务侧 assets）的 `.svg` 文件中复用。

```jsx
// ❌ 禁止：组件内内联 SVG
const ChevronRightIcon = () => (
  <svg viewBox="0 0 8 14" fill="none">
    <path d="..." fill="currentColor" />
  </svg>
);

// ❌ 禁止：作为图片 URL 引入，无法控制内部色值
import attentionIcon from 'common/assets/images/attention.svg';
<img src={attentionIcon} alt="attention" />

// ✅ 必须：独立 .svg 文件 + ReactComponent 具名导入
import { ReactComponent as ChevronRightSvg } from 'common/assets/images/chevron-right.svg';
import { ReactComponent as AttentionIcon } from 'common/assets/images/attention.svg';
<ChevronRightSvg />
<AttentionIcon />
```

**然后通过 CSS `color` 属性控制颜色：**

```jsx
// 通过 className 或 style 设置 color，currentColor 会继承
<AttentionIcon style={{ color: 'var(--text-secondary)' }} />
<AttentionIcon className={styles.icon} />  // .icon { color: var(--text-primary); }
```

缺图标时：先在 Figma / 设计资产中导出到 `common/assets/images/`，再引入；不要为了赶工在组件里贴 path。

## 主题 CSS 变量

使用项目已定义的 CSS 变量，而非写死色值：

```less
// ✅ 跟随主题的变量
color: var(--text-primary);
color: var(--text-secondary);
color: var(--icon-color);
color: var(--brand-color);
```

## 例外情况

语义固定的颜色（如涨跌色、告警色）可使用主题变量但**不可**写死：

```svg
<!-- ❌ 涨跌色也不能写死 -->
<path fill="#F5465D" />   <!-- 跌色 -->
<path fill="#0ECB81" />   <!-- 涨色 -->

<!-- ✅ 通过父元素 CSS 类控制 -->
<path fill="currentColor" />
```

```jsx
<ArrowIcon className={isRise ? styles.rise : styles.fall} />
// .rise { color: var(--color-rise); }
// .fall { color: var(--color-fall); }
```
