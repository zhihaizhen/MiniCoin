# PS = Position_Size 仓位数量 单个仓位的大小（币的个数，多仓为正，空仓为负）

# EP = Entry_Price 开仓价格 单个仓位的入场价格
# CP = Close_Price 平仓价格 单个仓位的平仓价格
# IP = Index_Price 指数价格 外部参考交易所的价格
# MP = Mark_Price 标记价格 指数价格与场内资金费率结合后，得到的合理价格。

# AD = Acc_Deposit 累计入金 累计充值金额
# AW = Acc_Withdrawl 累计出金 累计提现金额
# MMR = Maintenance_Margin_Ratio 维持保证金比例 在持仓过程中，交易者为保留仓位所需要的最小保证金金额，占仓位价值的比例。
# FO/FC = Fee_to_Open/Fee_to_Close 手续费  每个仓位会有两笔手续费，开仓、平仓。由其为maker/taker决定手续费比例是-2.5%%还是7.5%%

# BAP = Best_Available_Price 最优对手价 根据持仓方向(Long/Short)，若此时平仓可获得的100万USDT等值的BTC盘口深度价格（ETH/EOS/XRP取50万USDT盘口深度价格）
# EMA = Extra_Margin_Added 额外保证金添加
##在逐仓模式下，可以手动从AB’里抽取一部分资产放入该仓位的Position_Margin中，用于优化强平价，减缓强平触发。只有AB’>0时可以向逐仓中追加保证金

# U_PNL_A = 可用未结盈亏
# U_PNL = 未结盈亏 / Unrealized_PNL   U_PNL = (MP - EP) * PS

# IM = InitialMargin  起始保证金  IM=abs(PS)*IM Requirement%*EP  仓位 * 起始保证金率 * 开仓价格
# IM% = 1/杠杆
# PM = 仓位保证金(Position Margin) 
## 逐仓：#包括自己的盈与亏，以及后来补充的部分
 # PM ISO = abs(PS)*IM Requirement%*EP + FC + U_PnL+ EMA
 # 全仓：#不包括任何的未结盈亏，未接盈亏统一归入AB
 # PM CROSS = abs(PS)*IM Requirement%*EP+FC+U_PnL_SELF+Borrowed Credit_SELF
