import i18n from 'common/utils/i18n';
import { message, notify } from 'common/antdComponents';

// 止盈止损「建议价格」类错误码：文案含 {suggested_number} 占位符，需要用接口
// 返回的 data.suggested_number 在运行时替换。注意该占位符是 ztsl_error_code 命名空间里
// 现有的字面量单花括号写法，不是 i18next 的 {{var}} 插值语法，因此不能靠 i18n.t 自动插值，
// 需要手动 replace。以下中文文案仅作为远程翻译（CDN ztsl_error_code）未下发时的兜底
// defaultValue；其他语言需请翻译团队在同一 key 下补充对应语言文案（同样使用
// {suggested_number} 占位符），届时会自动生效，无需再改代码。
const SUGGESTED_NUMBER_ERROR_CODES = {
  41400041:
    '止盈价格必须大于{suggested_number}，需要更高于订单委托价或者当前实时价格',
  41400042:
    '止损价格必须小于{suggested_number}，需要更低于订单委托价或者当前实时价格',
  41400043:
    '止盈价格必须小于{suggested_number}，需要更低于订单委托价或者当前实时价格',
  41400044:
    '止损价格必须大于{suggested_number}，需要更高于订单委托价或者当前实时价格',
  41400045:
    '止盈或者止损价格必须大于{suggested_number}，否则不满足最小下单金额',
  41400046:
    '止盈或者止损价格必须小于{suggested_number}，否则不满足订单最大可下金额',
};

// 上述错误码仅会出现在这 4 个下单/改单接口的响应中
const SUGGESTED_NUMBER_ENDPOINTS = [
  '/spot/private/v1/order/create',
  '/spot/private/v1/order/update',
  '/spot/private/v1/plan_order/create',
  '/spot/private/v1/plan_order/update',
];

const getSuggestedNumberMessage = (data) => {
  const template = SUGGESTED_NUMBER_ERROR_CODES[data?.code];
  const translated = i18n.t(`ztsl_error_code:${data?.code}`, {
    defaultValue: template,
  });
  const suggestedNumber = data?.data?.suggested_number;
  if (suggestedNumber === undefined || suggestedNumber === null) {
    return translated;
  }
  return translated.replace('{suggested_number}', suggestedNumber);
};

const toastErrorMsg = (data, url) => {
  if (typeof data === 'string') {
    message.error(data);
    return;
  }

  if (
    SUGGESTED_NUMBER_ERROR_CODES[data?.code] &&
    SUGGESTED_NUMBER_ENDPOINTS.some((path) => url?.includes(path))
  ) {
    const suggestedMsg = getSuggestedNumberMessage(data);
    if (data?.type === 'notify') {
      notify.error(data?.title, suggestedMsg);
    } else {
      message.error(suggestedMsg);
    }
    return;
  }

  const errorCodeTranslation = i18n.t(`ztsl_error_code:${data?.code}`);

  if (String(data?.code) === errorCodeTranslation) {
    const defaultMsg = i18n.t('ztsl_error_code:default');
    const msg = defaultMsg === 'default' ? data?.message : defaultMsg;
    const newObj = {
      ...data,
      url,
    };
    const newMsg = JSON.stringify(newObj);
    message.error(`${data?.code ?? 9000000}: ${newMsg}`);
  } else if ([26200007, 26200011].indexOf(data?.code) > -1) {
    message.error(`${data?.code}: ${errorCodeTranslation}`);
  } else if (data && data?.type === 'notify') {
    notify.error(data?.title, errorCodeTranslation);
  } else {
    message.error(errorCodeTranslation);
  }
};

export default toastErrorMsg;
