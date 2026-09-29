import { useI18n } from './i18n'
import createRequest, {
  reportInterceptors,
  apiInterceptors,
  AxiosRequestConfig
} from '@unified/request'
import { toast } from './toast'

const request = createRequest()
  .useRequest(reportInterceptors.request, {})
  .useResponse(reportInterceptors.response, reportInterceptors.error, {})
  .useRequest(apiInterceptors.request)
  .useResponse(apiInterceptors.response, apiInterceptors.error)

request.useResponse(null, (err) => {
  // 延迟获取 t 函数，避免循环依赖
  const { t } = useI18n()
  
  const code = err.code
  const config = err.config
  const i18nMsg = t(`ztsl_error_code:${code}`)

  // 将message转换为tms配置的错误文案
  if (err.network_error) {
    // 跨域、403等网络错误
    err.message = t(`ztsl_error_code:network`)
  } else if (String(code) !== i18nMsg) {
    // 匹配到TMS的Code
    err.message = code + ':' + i18nMsg
  } else {
    // 匹配不到TMS的Code
    err.message = code + ':' + t('ztsl_error_code:default')
  }

  if (config.showErrorMessage && !isUnLogin(code)) {
    toast.error({ message: err.message, grouping: true })
  }

  return Promise.reject(err)
})

export function isUnLogin(code: number) {
  return code === 26200007 || code === 26200011
}

export const fetch = request // 临时兼容一些项目的引用方式
export { request, AxiosRequestConfig }
