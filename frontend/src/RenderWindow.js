import * as PIXI from 'pixi.js'

export default class RenderWindow {
  constructor(props) {
    this.defaults = {
      backgroundColor: 0xffffff,
    }

    this.brain = props.brain
    this.size = props.size
    this.aspectRatio = this.size[0] / this.size[1]
    this.renderer = PIXI.autoDetectRenderer(
      this.size[0],
      this.size[1],
      { preserveDrawinngBuffer: true },
    )

    this.renderer.backgroundColor = props.backgroundColor || this.defaults.backgroundColor

    this.stage = new PIXI.Container()

    // eslint-disable-next-line
    const oldCanvas = document.getElementsByTagName('canvas')[0]
    this.renderer.view.classList.add('canvas')
    oldCanvas.replaceWith(this.renderer.view)

    const setup = () => {
      console.log('doing setup!')
      const cat = new PIXI.Sprite(PIXI.loader.resources.test1.texture)
      this.stage.addChild(cat)
      this.renderer.render(this.stage)
    }

    PIXI.loader
      .add('test1', 'images/test1.png')
      .load(setup)
  }

  drawImage(name, { x, y }) {
    console.log(`drawing ${name}`)
    console.log(x, y)
    console.log(`Clearing before render? ${this.renderer.clearBeforeRender}`)
    const cat = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    cat.x = x
    cat.y = y
    this.stage.addChild(cat)
    this.renderer.render(this.stage)
  }

  getWidth() {
    return this.size[0]
  }

  getHeight() {
    return this.size[1]
  }
}
