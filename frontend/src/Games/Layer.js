import * as PIXI from 'pixi.js'

export default class Layer {
  constructor(props) {
    this.name = props.name

    this.container = new PIXI.Container()
  }
}
