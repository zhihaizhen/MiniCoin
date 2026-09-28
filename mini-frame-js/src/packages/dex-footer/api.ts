import { request } from '@/utils/request'
import { API_HOST } from '@/utils/host'

const URL = {
  currentCountryCode: `${API_HOST}/user/public/v3/country-code`,
  getSocialMediaList: `${API_HOST}/commom-public/index/public/v2/mult-social-media/list`
}

export const getCurrentCountryCode = () => {
  return request.get(URL.currentCountryCode)
}

export const getSocialMediaList = () => {
  return request.get(URL.getSocialMediaList)
}
