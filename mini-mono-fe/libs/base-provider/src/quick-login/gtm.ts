//  eventOperation ep事件操作
//  EventCategory  ec事件类别
//  EventLabel     el事件标签
const jsBridgeLogin = {
  loginOpenModel: {
    ep: 'click',
    ec: 'jsBridgeLoginOpenModel',
    el: 'web'
  },
  loginSuccess: {
    ep: 'click',
    ec: 'jsBridgeLoginSuccess',
    el: 'web'
  },
  loginError: {
    ep: 'click',
    ec: 'jsBridgeLoginError',
    el: 'web'
  }
};
const jsBridgeRegister = {
  registerOpenModel: {
    ep: 'click',
    ec: 'jsBridgeRegisterOpenModel',
    el: 'web'
  },
  registerSuccess: {
    ep: 'click',
    ec: 'jsBridgeRegisterSuccess',
    el: 'web'
  },
  registerError: {
    ep: 'click',
    ec: 'jsBridgeRegisterError',
    el: 'web'
  }
};
export { jsBridgeLogin, jsBridgeRegister };
