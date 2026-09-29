const MICROFUSION_SRC = '/static/common/base/js/index.js'
const MICROFUSION_ATTR = 'data-dex-microfusion'

let loading: Promise<void> | null = null

export function ensureMicrofusionScript(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()

  const existed = document.querySelector(`script[${MICROFUSION_ATTR}="1"]`) as HTMLScriptElement | null
  if (existed) return Promise.resolve()

  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = MICROFUSION_SRC
    script.setAttribute(MICROFUSION_ATTR, '1')
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  }).finally(() => {
    loading = null
  })

  return loading
}
