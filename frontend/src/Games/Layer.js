import * as PIXI from 'pixi.js'

export default class Layer {
  constructor(props) {
    this.name = props.name

    if (props.container) {
      this.container = props.container
    } else {
      this.container = new PIXI.Container()
    }
  }

  addImage(name, { x, y }) {
    const img = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    img.x = x
    img.y = y
    this.container.addChild(img)
  }
}
