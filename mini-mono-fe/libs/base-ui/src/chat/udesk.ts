// @ts-nocheck
import sha1 from 'js-sha1';
import { getLang, udesk_lang_map } from '@better-bit-fe/base-utils';

const getSignature = (nonce, timestamp, webToken) => {
  const key = '10158d1f5376f5047da056fbd59bd40d';
  let signStr = `nonce=${nonce}&timestamp=${timestamp}&web_token=${webToken}&${key}`;
  signStr = sha1(signStr);
  signStr = signStr.toUpperCase();
  return signStr;
};

const makeRandomStr = (num) => {
  const e = num;
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const a = t.length;
  let n = '';
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
};

const obj = {
  show: false, //面板的状态
  start(data) {
    this.createUdeskScript(data);   
  },
 
  openUdPanel() {
    if (window.ud && !this.show) {
      const ud = window.ud;
      ud('showPanel');
    }
  },
  hideUdPanel() {
    if (window.ud && this.show) {
      const ud = window.ud;
      ud('hidePanel');
    }
  },
  loadUdeskScript() {
    (function (a, h, c, b, f, g) {
      a['UdeskApiObject'] = f;
      a[f] =
        a[f] ||
        function () {
          (a[f].d = a[f].d || []).push(arguments);
        };
      g = h.createElement(c);
      g.async = 1;
      g.src = b;
      c = h.getElementsByTagName(c)[0];
      c.parentNode.insertBefore(g, c);
    })(
      window,
      document,
      'script',
      'https://assets-cli.s2.udesk.cn/im_client/js/udeskApi.js',
      'ud'
    );
  },
  createUdeskScript(data) {
    // console.log('step2,createUdeskScript函数调用', !window.ud);
     if(!window.ud){
      this.loadUdeskScript();
     }
    const ud = window.ud;
    const Timestamp = new Date().getTime(); //13位
    const Nonce = makeRandomStr(32);
    const Webtoken = data?.id;
    const lang = udesk_lang_map[getLang()];
    const udParams = {
      code: '29b3e005', //公司唯一标识
      link: `https://leaventus.s2.udesk.cn/im_client/?web_plugin_id=63018`, //公司IM Client链接地址
      customer: {
        c_name: data?.nick_name,
        c_email: data?.email,
        c_phone: data?.mobile,
        nonce: Nonce,
        timestamp: Timestamp,
        web_token: Webtoken, //客户唯一标识
        signature: getSignature(Nonce, Timestamp, Webtoken)
      }, //客户身份认证参数
      // manualInit: false,
      panel: {
        onToggle: function (data) {
          if (data.visible) {
            this.show = true;
          } else {
            this.show = false;
          }
        },
        
      },
      mode: 'inner', //按钮打开窗口显示模式
      color: '#307AE8',
      pos_flag: 'crb', //按钮形状+位置 vrb表示纵向右下角
      language: lang, //语言
      onlineText: '',
      offlineText: '',
      targetSelector: '#brandChat',
 
      onUnread: function (data) {
        const count = data.count;
      },
      onReady: function () {
        if(data.isVistor){
          setTimeout(()=>{
            // console.log('step5,游客打开面板');  
            ud('showPanel');

          },0)
        }
      
      }
    };
    ud(udParams);
  }
};

export default obj;
