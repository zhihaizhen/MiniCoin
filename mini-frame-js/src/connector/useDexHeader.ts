import { useBase, CreateParams } from './useBase'
import type { State } from '@/packages/dex-header/hooks/useDexHeader'

let state: ReturnType<typeof initState>

function initState() {
  const { createComponent, removeComponent, getComponent } = useBase('DexHeader')

  const createDexHeader = async (params?: CreateParams) => {
    const component = await createComponent(params)
    return component.state as State
  }

  async function getDexHeader() {
    const component = await getComponent()
    return component.state as State
  }

  return {
    createDexHeader,
    removeDexHeader: removeComponent,
    getDexHeader
  }
}

export function useDexHeader() {
  if (!state) {
    state = initState()
  }

  return state
}
