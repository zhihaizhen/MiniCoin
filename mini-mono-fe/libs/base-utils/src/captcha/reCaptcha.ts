/** google验证码 */
const reCaptcha = {
  key: 'recaptcha',
  src: 'https://www.google.com/recaptcha/api.js?render=explicit',
  options: {
    siteKey: '6LeNsZIUAAAAANOHTT1IaGp-RlIFHP2-YyaponYD'
  },
  init(context, options, callback) {
    context.recaptchaElm = document.createElement('div')
    context.recaptchaElm.id = context.id
    context.recaptchaElm.style.position = 'fixed'
    context.recaptchaElm.style.top = '75px'
    context.recaptchaElm.dataset.sitekey = options.siteKey
    document.body.appendChild(context.recaptchaElm)

    return new Promise<void>((resolve) => {
      window.grecaptcha.ready(function () {
        context.captcha = window.grecaptcha.render(context.id, {
          sitekey: options.siteKey,
          size: 'invisible',
          classes: 'zs-test',
          callback(recaptchaToken) {
            callback({ g_recaptcha_response: recaptchaToken })
            window.grecaptcha.reset(context.captcha)
          },
          'expired-callback': () => {
            console.error('Google ReCAPTCHA expired callback')
            window.grecaptcha.reset(context.captcha)
          },
          'error-callback': () => {
            console.error('Google ReCAPTCHA error callback')
            window?.dataLayer?.push({
              event: 'GAEvent',
              eventAction: 'error',
              eventCategory: 'CaptchaValidation_recaptcha_ontrigger_error',
              eventLabel: 'error.recaptcha'
            })
            window.grecaptcha.reset(context.captcha)
          }
        })
        resolve()
      })
    }).catch((error) => {
      console.error('ReCAPTCHA Init Promise', error)
    })
  },
  show(context) {
    try {
      window.grecaptcha.execute(context.captcha)
    } catch (e) {
      console.error('ReCAPTCHA Show', e)
    }
  }
}

export default reCaptcha
