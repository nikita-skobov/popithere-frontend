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
}
