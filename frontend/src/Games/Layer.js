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
    let img
    if (typeof name === 'string') {
      img = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    } else {
      img = new PIXI.Sprite(name)
    }
    img.x = x
    img.y = y
    this.container.addChild(img)
  }

  removeAllChildren() {
    this.container.removeChildren()
  }

  addLayer(layer) {
    this.container.addChild(layer.container)
  }
}
