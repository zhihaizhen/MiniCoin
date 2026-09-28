// @ts-nocheck

export function formatThousandDigit(val: string) {
  if (val?.includes('.')) {
    const splitValue = val.split('.');
    const formatInt = Number(splitValue[0]).toLocaleString();
    const decimals = splitValue[1];
    return formatInt + '.' + decimals;
  } else {
    return Number(val).toLocaleString();
  }
}

export function emailCheck(val: string) {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val);
}

export function getLang() {
  const langReg = /([a-z]{2}-[A-Z]{2})/;
  let refLang = location.href.match(langReg);
  if (refLang) {
    refLang = refLang[0];
  }
  const lang = refLang || localStorage.getItem('LANG_KEY') || 'zh-CN';
  //获取到之后set
  localStorage.setItem('LANG_KEY', lang);
  return lang;
}

export const getUrlAfterLangChange = (path) => {
  if (typeof window !== 'undefined') {
    const langReg = /([a-z]{2}-[A-Z]{2,3})/;
    const lang = getLang();
    // 导航上有语言，直接拼接
    //如果是en-US/aboutUs点击呢
    // if (langReg.test(location.href)) {
    //   lang = location.href.match(langReg)[0];
    // }

    const newUrl = `/${lang}${path}/`;
    return newUrl;
  }
  console.log('newUrl no broswer', path);
  return path;
};

export const taskTypeMap = {
  Future: {
    token_user_trade: {
      btnText: 'goTrade',
      pageUrl: '/trade/usdt/BTCUSDT',
      pageUrlH5: 'contract/trade?symbol=BTCUSDT',
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
    },
    token_user_trade: {
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
    },
    token_start_spot_grid: {
      btnText: 'goTrade',
      pageUrl: 'trading-bot/?type=spotGrid',
      pageUrlH5: 'spot?type=strategy',
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
    },
    once_user_invite: {
      btnText: 'goInvite',
      pageUrl: '',
      pageUrlH5: 'referral',
      taskText: {
        first: 'goSignUp',
        trigger_times: 'goSignUp', // 用不到
        trade_turnover: 'goSignUp' // 用不到
      }
    },
    once_user_be_invited: {
      btnText: 'goSignUp',
      pageUrl: 'login/register',
      pageUrlH5: 'register',
      taskText: {
        first: 'goSignUp',
        trigger_times: 'goSignUp', // 用不到
        trade_turnover: 'goSignUp' // 用不到
      }
    },
    once_user_kyc: {
      btnText: 'goToKYC',
      pageUrl: 'setting/kyc',
      pageUrlH5: 'kyc',
      taskText: {
        first: 'goSignUp',
        trigger_times: 'goSignUp', // 用不到
        trade_turnover: 'goSignUp' // 用不到
      }
    },
    once_user_bind_em_mob: {
      btnText: 'goBindEmailMobile',
      pageUrl: 'setting/account-safe',
      pageUrlH5: 'SecurityPage',
      taskText: {
        first: 'goSignUp',
        trigger_times: 'goSignUp', // 用不到
        trade_turnover: 'goSignUp' // 用不到
      }
    }
  },
  Wealth: {
    token_user_liquid_trade: {
      btnText: 'goEarn',
      pageUrl: 'earn/savings',
      pageUrlH5: 'spot?index=1',
      taskText: {
        first: 'goEarn',
        trigger_times: 'goEarn', // 用不到
        trade_turnover: 'goEarn' // 用不到
      }
    },
    token_user_fixed_trade: {
      btnText: 'goEarn',
      pageUrl: 'earn/savings',
      pageUrlH5: 'spot?index=1',
      taskText: {
        first: 'goEarn',
        trigger_times: 'goEarn', // 用不到
        trade_turnover: 'goEarn' // 用不到
      }
    }
  }
};

export const isAppVersionAbove = (
  currentVersion: string,
  targetVersion: string
) => {
  const currVerArr = currentVersion
    .split('.')
    .map((item) => parseInt(item, 10));
  const targetVerArr = targetVersion
    .split('.')
    .map((item) => parseInt(item, 10));

  const len = Math.max(currVerArr.length, targetVerArr.length);
  for (let i = 0; i < len; i++) {
    const currVerNum = currVerArr[i] || 0;
    const targetVerNum = targetVerArr[i] || 0;

    if (currVerNum > targetVerNum) {
      return true;
    } else if (currVerNum < targetVerNum) {
      return false;
    }
  }

  return true; // Versions are equal
};

export function getBitAppVersion(userAgent: string) {
  const regex = /bit_app\/([^\/]+)\//;
  const match = userAgent.match(regex);
  return match ? match[1] : null;
}
