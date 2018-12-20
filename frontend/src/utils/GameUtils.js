import * as PIXI from 'pixi.js'
import { createRoot } from '../utils/PixiUtils'
import PopItHere from '../Games/PopItHere'

/**
 * @todo write a fetch helper
 * to fetch the current game from a server
 */
export function getCurrentGame({ renderer, modal, canvas }) {
  const root = createRoot(renderer, { interactive: true })

  const modalInner = {
    // here we only want the Game instance
    // to have access to isOpen and toggle. we don't want
    // to give Game access to setState, render, etc.
    isOpen: modal.isOpen,
    toggle: modal.toggle,
  }

  const canvasInner = {
    // only give game access to certain canvas methods
    endGame: canvas.endGame,
    newButtons: canvas.newButtons,
  }

  return new PopItHere({
    renderer,
    root,
    modal: modalInner,
    canvas: canvasInner,
  })
}

export function getLocalPosition(event, root) {
  return event.data.getLocalPosition(root)
}

export function calculateCenterPosition(name, clickPos) {
  let width
  let height
  if (typeof name === 'string') {
    ({ width, height } = PIXI.loader.resources[name].texture)
  } else {
    // in this case, name is already a texture
    ({ width, height } = name)
  }
  // calculate the center by dividing the texture width & height half
  return { x: clickPos.x - (width / 2), y: clickPos.y - (height / 2) }
}
