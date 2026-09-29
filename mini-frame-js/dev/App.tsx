import React, { useEffect, useRef, useState } from 'react'
import { toast } from '@/utils/toast'
import { useDexHeader } from '@/connector'
import DevHelper, { DevHelperRef } from '@/packages/dev-helper/Index'
import './App.less'

const { createDexHeader, removeDexHeader } = useDexHeader()

interface ComponentItem {
  id: string
  title?: string
  create: typeof createDexHeader
  remove: typeof removeDexHeader
  instance: any
  props?: any
}

export default function App() {
  const devHelperRef = useRef<DevHelperRef>(null)
  const [components, setComponents] = useState<ComponentItem[]>([
    {
      id: 'DexHeader',
      create: createDexHeader,
      remove: removeDexHeader,
      instance: null
    },
    {
      id: 'DexHeader',
      title: 'Dex Home Header',
      create: createDexHeader,
      remove: removeDexHeader,
      instance: null,
      props: {
        type: 'home'
      }
    }
  ])

  async function toggleComponent(index: number) {
    const component = components[index]
    if (!component.instance) {
      const instance = await component.create({ elementId: component.id, props: component.props })
      setComponents((prev) => prev.map((c, i) => (i === index ? { ...c, instance } : c)))
      localStorage.setItem('@global-widget:componentId', component.title || component.id)
      toast.success(`成功加载组件 ${component.id}`)
    } else {
      setComponents((prev) => prev.map((c, i) => (i === index ? { ...c, instance: null } : c)))
      localStorage.removeItem('@global-widget:componentId')
      await component.remove()
    }
  }

  useEffect(() => {
    devHelperRef.current?.setVisible(true)
  }, [])

  return (
    <DevHelper ref={devHelperRef}>
      {components.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="component"
          onClick={() => toggleComponent(index)}
        >
          ⚙️ {item.title || item.id}
          <small>{item.instance ? '已加载' : ''}</small>
        </div>
      ))}
    </DevHelper>
  )
}
