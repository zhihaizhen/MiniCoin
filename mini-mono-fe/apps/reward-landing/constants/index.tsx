export const taskTypeMap = {
  Future: {
    token_user_trade: {
      btnText: 'goTrade',
      pageUrl: '/trade/usdt/BTCUSDT',
      pageUrlH5: 'contract/trade?symbol=M1BTCUSDT',
      taskText: {
        first: 'curFutureTradeNum',
        trigger_times: 'curFutureTradeNum',
        trade_turnover: 'curFutureTradeAmount'
      }
    }
  },
  CopyTrading: {
    token_copy_trade: {
      btnText: 'goCopyTrade',
      pageUrl: 'downloadApp',
      pageUrlH5: 'copy_trading/plaza',
      taskText: {
        first: 'curCopyTradeAmount',
        trigger_times: 'curCopyTradeNum',
        trade_turnover: 'curCopyTradeAmount'
      }
    }
  },
  Spot: {
    token_user_trade: {
      btnText: 'goTrade',
      pageUrl: '/spot/exchange/BTC/USDT',
      pageUrlH5: 'spot?symbol=BTCUSDT',
      taskText: {
        first: 'curTradeSpotNum',
        trigger_times: 'curTradeSpotNum',
        trade_turnover: 'curTradeSpotAmount'
      }
    }
  },
  Asset: {
    // 以下是入金
    token_user_deposit: {
      btnText: 'goDeposit',
      pageUrl: '/assets/deposit',
      pageUrlH5: 'deposit',
      taskText: {
        first: 'curDepositNum',
        trigger_times: 'curDepositNum',
        trade_turnover: 'curDepositAmount'
      }
    },
    token_user_net_deposit: {
      btnText: 'goDeposit',
      pageUrl: '/assets/deposit',
      pageUrlH5: 'deposit',
      taskText: {
        first: 'curDepositNum',
        trigger_times: 'curDepositNum',
        trade_turnover: 'curDepositAmount'
      }
    }, //用户净入金
    token_user_withdrawal: {
      btnText: 'goWithdrawal',
      pageUrl: '/assets/withdrawal',
      pageUrlH5: 'withdrawal',
      taskText: {
        first: 'curWithdrawalNum',
        trigger_times: 'curWithdrawalNum',
        trade_turnover: 'curWithdrawalAmount'
      }
    }
  },
  User: {
    once_user_register: {
      btnText: 'goSignUp',
      pageUrl: 'login/register',
      pageUrlH5: 'register',
      taskText: {
        first: 'goSignUp',
        trigger_times: 'goSignUp', // 用不到
        trade_turnover: 'goSignUp' // 用不到
      }
    }
  }
};
