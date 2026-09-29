// @ts-nocheck
import { Env, urlInfo } from '@region-lib/env';
import jsrsasign from 'jsrsasign';

const { env } = urlInfo;
const envConfig = require(`./publickey.js`);
const key = envConfig[`publicKeyPEM-${env}`];

// RSAOAEP 摘要算法sha256 MGF1为MD5 加密内容编码格式为文本，加密结果编码为Base64
const encryptLong = (string) => {
  const pub = jsrsasign.KEYUTIL.getKey(key);
  const k = jsrsasign.KJUR.crypto.Cipher;
  try {
    const len = string.length;
    let encryptedRes = ''; // 结果
    const bytes = []; // 存储每一次截取的位置,因为RSA每次加密117bytes
    bytes.push(0);
    let byteNo = 0;
    let sixteenCode; // 字符串转为十六进制的code
    let temp = 0;
    for (let i = 0; i < len; i++) {
      sixteenCode = string.charCodeAt(i);
      if (sixteenCode >= 0x010000 && sixteenCode <= 0x10ffff) {
        byteNo += 4;
      } else if (sixteenCode >= 0x000800 && sixteenCode <= 0x00ffff) {
        byteNo += 3;
      } else if (sixteenCode >= 0x000080 && sixteenCode <= 0x0007ff) {
        byteNo += 2;
      } else {
        byteNo += 1;
      }
      if (byteNo % 117 >= 114 || byteNo % 117 == 0) {
        if (byteNo - temp >= 114) {
          bytes.push(i);
          temp = byteNo;
        }
      }
    }
    // console.log('最后的字节数', bytes, '总的字符串', string);
    //2.截取字符串并分段加密
    if (bytes.length > 1) {
      for (let i = 0; i < bytes.length - 1; i++) {
        let str; // 每一次加密的字符串
        if (i == 0) {
          str = string.substring(0, bytes[i + 1] + 1);
        } else {
          str = string.substring(bytes[i] + 1, bytes[i + 1] + 1);
        }
        const t1 = k.encrypt(str, pub, 'RSAOAEP256');
        encryptedRes += t1;
      }
      // 最后一段加密
      if (bytes[bytes.length - 1] != string.length - 1) {
        const lastStr = string.substring(bytes[bytes.length - 1] + 1);
        encryptedRes += k.encrypt(lastStr, pub, 'RSAOAEP256');
      }
      const base64Str = jsrsasign.hextob64(encryptedRes);
      return {
        data: base64Str
      };
    }
    const enc = jsrsasign.KJUR.crypto.Cipher.encrypt(string, pub, 'RSAOAEP256');
    const base64Str = jsrsasign.hextob64(enc);
    return {
      data: base64Str
    };
  } catch (ex) {
    return false;
  }
};

export { encryptLong };
