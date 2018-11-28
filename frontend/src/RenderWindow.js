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

    // eslint-disable-next-line
    const oldCanvas = document.getElementsByTagName('canvas')[0]
    this.renderer.view.classList.add('canvas')
    oldCanvas.replaceWith(this.renderer.view)

    const setup = () => {
      console.log('doing setup!')
      this.cat = new PIXI.Sprite(PIXI.loader.resources.test1.texture)
      this.renderer.render(this.cat)
    }

    PIXI.loader
      .add('test1', 'images/test1.png')
      .load(setup)
  }

  drawImage(name, { x, y }) {
    this[name].x = x
    this[name].y = y
    this.renderer.render(this[name])
  }
}
