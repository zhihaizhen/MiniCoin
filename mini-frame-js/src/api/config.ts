import { camelizeKeys } from 'humps'
import { request, AxiosRequestConfig } from '@/utils/request'
import { API_HOST } from '@/utils/host'

async function fetch<T>(options: AxiosRequestConfig, camelize = true) {
  try {
    const response = await request(options)
    const data: T = camelize ? (camelizeKeys(response as any) as any) : response
    return data
  } catch (e) {
    throw camelizeKeys(e)
  }
}
