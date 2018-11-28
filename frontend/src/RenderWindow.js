import * as PIXI from 'pixi.js'

export default class RenderWindow {
  constructor(props) {
    this.defaults = {
      backgroundColor: 0xafa0fb,
      maxSprites: 10,
    }

    this.brain = props.brain
    this.size = props.size
    this.aspectRatio = this.size[0] / this.size[1]
    this.renderer = PIXI.autoDetectRenderer(
      this.size[0],
      this.size[1],
      { preserveDrawinngBuffer: false },
    )

    this.renderer.backgroundColor = props.backgroundColor || this.defaults.backgroundColor

    this.stage = new PIXI.Container()
    this.maxSprites = props.maxSprites || this.defaults.maxSprites

    // eslint-disable-next-line
    const oldCanvas = document.getElementsByTagName('canvas')[0]
    this.renderer.view.classList.add('canvas')
    oldCanvas.replaceWith(this.renderer.view)
  }

  addImage(name, { x, y }) {
    console.log(`drawing ${name}`)
    console.log(x, y)
    const cat = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    cat.x = x
    cat.y = y
    this.stage.addChild(cat)
  }

  render() {
    const numSprites = this.stage.children.length
    if (numSprites > this.maxSprites) {
      // remove the oldest sprites
      const diff = numSprites - this.maxSprites
      console.log(`removing ${diff} sprites`)
      this.stage.removeChildren(0, diff)
    }
    this.renderer.render(this.stage)
  }

  afterLoad() {
    console.log('Assets loaded!')
    this.render()
  }

  changeMaxSprites(newMax) {
    this.maxSprites = newMax
  }

  loadAssets(assetArray, cb) {
    let callback = cb
    if (!callback) {
      callback = this.afterLoad
    }

    PIXI.loader.add(assetArray).load(callback.bind(this))
  }

  getWidth() {
    return this.size[0]
  }

  getHeight() {
    return this.size[1]
  }
}
