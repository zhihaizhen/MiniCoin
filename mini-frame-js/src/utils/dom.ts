/**
 * 纯 DOM 操作工具 - 无外部依赖
 * 用于首屏加载，避免引入不必要的模块
 */

export function createElement(id: string) {
  let el = document.querySelector('#' + id)
  if (!el) {
    el = document.createElement('div')
    el.id = id
    document.body.append(el)
  }
  return el
}

export function preRender(newEleContainer: Element, elementId: string, postion?: undefined | 'middle') {
  if (elementId !== 'DexHeader' && elementId !== 'interfuse_header') return null
  const header = newEleContainer
  const newEle = document.createElement('div')
  const newImg = document.createElement('img')
  newImg.style.cssText = `
    width: 143px;
    height: 34px;
  `
  newImg.src = '/static/image/header/brand.svg?url'
  if (postion === 'middle') {
    const newEleWrapper = document.createElement('div')
    newEleWrapper.style.cssText = `
    max-width: 1332px;
    width:100%;
    margin:0 auto;
    height: 64px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: #17181F;
    color: #fff;
    font-size: 14px;
    `
    newEleWrapper.appendChild(newImg)
    newEle.appendChild(newEleWrapper)
  } else {
    newEle.appendChild(newImg)
  }
  newEle.style.cssText = `
    width: 100vw;
    height: 64px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: #17181F;
    color: #fff;
    font-size: 14px;
    position:absolute;
    top:0;
    left:0;
    z-index:1;
    cursor: pointer;
  `
  header.appendChild(newEle)
  return newEle
}

