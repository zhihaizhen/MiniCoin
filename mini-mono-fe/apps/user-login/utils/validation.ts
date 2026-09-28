export const emailShow = (str) => {
  return str.replace(/\w+([-|\.]\w+)*@[\w]+\.[a-z]+/g, (mail) => {
    return mail.replace(/(\w{1}).*(\w{1})@(.*)/, '$1***$2@$3');
  });
};

// export const phoneShow = (str) => {
//   return str.replace(/1[3-9]\d{9}/g, (phone) => {
//     return phone.replace(phone.substring(3, 7), '****');
//   });
// };

export const VagueMobile = (mobile) => {
  if (!mobile) {
    return mobile;
  }
  const len = mobile.length;

  switch (len) {
    case 7:
      return mobile.substring(0, 2) + '***' + mobile.substring(5, len);
    case 8:
    case 9:
      return mobile.substring(0, 2) + '****' + mobile.substring(6, len);
    case 10:
      return mobile.substring(0, 3) + '****' + mobile.substring(7, len);
    case 11:
      return mobile.substring(0, 3) + '*****' + mobile.substring(8, len);
  }
  return mobile;
};

/**
 * 邮箱验证
 * @param mail string
 * @returns
 */
export const emailValidate = (mail: string) => {
  const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  return reg.test(mail);
};

/**
 * 密码校验
 * @param pwd string
 * @returns
 */
export const pwdValidate = (pwd: string) => {
  const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,30}$/;
  return reg.test(pwd);
};

export const pwdLenValidate = (pwd: string) => {
  const reg = /^.{8,30}$/;
  return reg.test(pwd);
};

export const pwdUppercaseValidate = (pwd: string) => {
  const reg = /^(?=.*[A-Z]).{1,}$/;
  return reg.test(pwd);
};
export const pwdLowercaseValidate = (pwd: string) => {
  const reg = /^(?=.*[a-z]).{1,}$/;
  return reg.test(pwd);
};

export const pwdNumberValidate = (pwd: string) => {
  const reg = /^(?=.*\d).{1,}$/;
  return reg.test(pwd);
};

export const pwdRuleList = [
  {
    isChecked: false,
    checkRule: pwdLenValidate,
    msg: 'queryCharactersLen'
  },
  {
    isChecked: false,
    checkRule: pwdUppercaseValidate,
    msg: 'queryUppercaseLetter'
  },
  {
    isChecked: false,
    checkRule: pwdLowercaseValidate,
    msg: 'queryLowercaseLetter'
  },
  {
    isChecked: false,
    checkRule: pwdNumberValidate,
    msg: 'queryNumber'
  }
];

/**
 * 邀请码校验
 * @param refCode
 * @returns
 */
export const refCodeValidate = (refCode: string) => {
  const reg = /^[A-Za-z0-9]{1,10}$/;
  return reg.test(refCode);
};

/**
 * 手机号码校验
 * @param phone
 * @returns
 */
export const phoneValidate = (phone: string, area_code) => {
  let reg = /^\d{5,15}$/;
  if (area_code === '86') {
    reg = /^1[3-9]\d{9}$/;
  }
  if (area_code === '84') {
    // reg = /^((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/;
    reg = /^(?:[35789][0-9]{8}|0[35789][0-9]{8})$/g;
  }
  // const reg = area_code === '86' ? /^1[3-9]\d{9}$/ : /^\d{5,15}$/;
  return reg.test(phone);
};

export const passwordLengthValidate = (password: string) => {
  return /^[^]{8,30}$/.test(password);
};

export const passwordLowerValidate = (password: string) => {
  return /[a-z]+/.test(password);
};
export const passwordUpperValidate = (password: string) => {
  return /[A-Z]+/.test(password);
};
export const passwordNumberValidate = (password: string) => {
  return /[0-9]+/.test(password);
};

export const passwordVaidate = (password: string) => {
  return (
    passwordLengthValidate(password) &&
    passwordLowerValidate(password) &&
    passwordUpperValidate(password) &&
    passwordNumberValidate(password)
  );
};
