import { useBase, CreateParams } from './useBase'

let state: ReturnType<typeof initState>

function initState() {
  const { createComponent, removeComponent, getComponent } = useBase('DexFooter')

  const createDexFooter = async (params?: CreateParams) => {
    const component = await createComponent(params)
    return component.state
  }

  async function getDexFooter() {
    const component = await getComponent()
    return component.state
  }

  return {
    createDexFooter,
    removeDexFooter: removeComponent,
    getDexFooter
  }
}

export function useDexFooter() {
  if (!state) {
    state = initState()
  }

  return state
}

