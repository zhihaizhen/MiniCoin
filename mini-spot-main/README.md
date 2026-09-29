# 现货交易
node version v20.4.0
整体架构：marvel + TypeScript + React + Ant Design +  Axios
## 启动
step1: yarn
setp2: yarn start 
setp3: http://dev.test.bitrunfinance.com:8001/zh-CN/spot/exchange/BTC/USDT   


## 重要文件说明

### 项目结构
```text
+ src
  + - .marvel // marvel工具的配置文件
    + - template // build后，生成html文件的模版
    + - webpack // 定义webpack相关的配置
  + - betterbitapps
    + - common 
      + - antdComponents // 封装的antd组件
      + - assets // 静态资源
      + - components  // 可复用的业务模块
      + - constants  // 全局定义的常量
      + - enums // 全局定义的可枚举
      + - global  // 常用的业务组件
      + - hooks  // 全局hooks，如frame
      + - model  // 全局数据字段转换
      + - packages-biz  // 组件库 如i18n，chart
      + - public-ws 
        + - stream-hooks  // 推送的数据流
        + - stream  // 定义stream
        + - webworker  // 共有推送
      + - services  // 后端接口
      + - types  // ts类型定义
      + - utils  // 常用工具
    + - forward/desktop // 
      + - assets // 静态文件
      + - components // 业务模块
      + - constants  // 定义的常量 
      + - containers  // 合约每个功能模块的入口文件
      + - hooks // 业务hooks
      + - services  // 后端接口
      + - store // 定义store （重要）
      + - store-hooks // 定义store-hooks （重要）
      + - app.jsx 
      + - index.js  // 入口文件
+ - package.json // 项目清单
```

### 样式常见修改文件
/common/assets/css/index.less  主样式入口文件
/common/packages-biz/by-chart/index.css  K线样式文件（没啥用）
/common/packages-biz/by-chart/tvOverrides.js  K线样式文件(改改背景色)
/mini-tradingview/charting_library/custom.css   为cdn文件，修改K线样式(用无痕刷新)
/static/common/base/css/index.css   cdn文件，定义了变量

<!-- 在global-widget项目里引入了/static/common/base/js/index.js文件，该js文件引入了/static/common/base/css/index.css文件。-->
<!-- js文件和css的源文件在cdn上，git地址为 XXX/frontend/cdn/common/-/blob/master/base/js/index.js -->

### 持仓区接口
1. 持仓：trade/private/v1/position/list-all
2. 当前委托：trade/private/v1/contract/get-open-orders
3. 历史委托：trade/private/v1/contract/get-history-orders
4. 交易历史： trade/private/v1/contract/order-fills?
5. 平仓盈亏： trade/private/v1/contract/close-pnl
6. 取消全部委托： trade/private/v1/contract/cancel-totally（包括止盈止损。限价。条件单）
8. 一键平仓： trade/private/v1/position/close-all

### 路由文件
src/betterbitapps/forward/desktop/utils/easy-router.js
### 精度的解释文件
src/betterbitapps/common/packages-biz/by-global-settings/index.js
### 拖拽布局文件
/forward/desktop/constants/layout.js
### 单位字段统一
现货 如BTC/USDT spotCoin=BTC walletCoin=USDT   coin=BTC
1. spotCoin(为下单单位，或者合约价值下单) 小数位取值 lotFraction
2. walletCoin(为资产单位，非合约价值下单)  小数位取值 walletCoinOrderFraction

### 交易常见定义
positionIdx  // 为0表示单向持仓，为1表示双向的多仓，2表示双向的空，





