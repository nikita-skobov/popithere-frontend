/* global document Image window */

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

export function createImage({ file, alreadyURL, makeTexture = true }) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      if (makeTexture) {
        const base = new PIXI.BaseTexture(img)
        const texture = new PIXI.Texture(base)
        res(texture)
      } else {
        res(img)
      }
    }
    img.src = alreadyURL ? file : URL.createObjectURL(file)
  })
}

export function createImageFromData(data, canvas, context) {
  canvas.setAttribute('width', data.width)
  canvas.setAttribute('height', data.height)
  context.putImageData(data, 0, 0)
  const url = canvas.toDataURL()
  return url
}

export function createGifTextures(gif) {
  return new Promise((res, rej) => {
    const opts = window.mySuperGif.init({ gif })
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    window.mySuperGif.load(opts)
      .then((stream) => {
        const newOpts = window.mySuperGif.parseHeader(stream, opts)
        let frames = window.mySuperGif.parseBlock(stream, newOpts)
        let images = frames.map(frame => createImageFromData(frame.data, canvas, context))
        let textures = images.map(imgUrl => createImage({ file: imgUrl, alreadyURL: true }))
        Promise.all(textures)
          .then((resolvedTextures) => {
            res(resolvedTextures)
            frames = null
            images = null
            canvas = null
            context = null
            textures = null
          })
      })
      .catch(err => rej(err))
  })
}
