/* global document */

import * as PIXI from 'pixi.js'

export function createRenderer({
  size,
  preserveDrawingBuffer,
  transparent,
}) {
  const renderer = PIXI.autoDetectRenderer(
    size[0],
    size[1],
    {
      preserveDrawingBuffer,
      transparent,
    },
  )

  return renderer
}

export function createRoot(renderer, opts) {
  // everything rendered will go inside root
  const root = new PIXI.Container()

  let interactive

  if (opts) {
    ({ interactive } = opts)
  }

  if (interactive) {
    root.interactive = true
    root.hitArea = new PIXI.Rectangle(0, 0, renderer.width, renderer.height)
  }

  // initial render so it shows up
  renderer.render(root)

  return root
}

export function replaceCanvas(view) {
  const oldCanvas = document.getElementsByTagName('canvas')[0]
  view.classList.add('canvas')
  oldCanvas.parentElement.replaceChild(view, oldCanvas)
}
