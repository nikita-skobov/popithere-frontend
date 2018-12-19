/* global document Image */

import * as PIXI from 'pixi.js'

export function createRenderer({
  size,
  preserveDrawingBuffer,
  transparent,
  backgroundColor,
}) {
  const renderer = PIXI.autoDetectRenderer(
    size[0],
    size[1],
    {
      preserveDrawingBuffer,
      transparent,
      backgroundColor,
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

export function loadAssets(assetArray, cb) {
  let callback = cb
  if (!callback) {
    callback = () => {}
  }
  PIXI.loader.add(assetArray).load(callback())
}

export function createImg(file, cb, alreadyURL) {
  const img = new Image()
  img.onload = () => {
    const base = new PIXI.BaseTexture(img)
    const texture = new PIXI.Texture(base)
    cb(texture, img)
  }
  img.src = alreadyURL ? file : URL.createObjectURL(file)
}
