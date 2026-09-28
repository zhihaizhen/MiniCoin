export function isURL(str: string) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
}

export const isEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
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
export const phoneValidate = (phone: string) => {
  const reg = /^\d{5,15}$/;
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
