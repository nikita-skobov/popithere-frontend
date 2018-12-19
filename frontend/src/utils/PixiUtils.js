import * as PIXI from 'pixi.js'

function createRenderer({
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

function createRoot(renderer, { interactive }) {
  // everything rendered will go inside root
  const root = new PIXI.Container()

  console.log(renderer)

  if (interactive) {
    root.interactive = true
    root.hitArea = new PIXI.Rectangle(0, 0, renderer.width, renderer.height)
  }

  // initial render so it shows up
  renderer.render(root)

  return { root }
}

module.exports = {
  createRenderer,
  createRoot,
}
