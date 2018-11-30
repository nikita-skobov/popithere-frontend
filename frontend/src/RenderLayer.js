import * as PIXI from 'pixi.js'

export default class RenderLayer {
  constructor(props) {
    // size: this.size,
    // interactive: false, // default is false
    // backgroundColor: props.backgroundColor, // default is white,
    // transparent: false, // default is false
    this.size = props.size

    this.renderer = PIXI.autoDetectRenderer(
      this.size[0],
      this.size[1],
      {
        preserveDrawinngBuffer: false,
        transparent: props.transparent || false,
      },
    )

    if (!props.transparent) {
      this.renderer.backgroundColor = props.backgroundColor || 0xffffff
    }

    // by default, no interaction
    this.inputBox = null

    if (props.interactive) {
      this.makeInteractive()
    }
  }

  makeInteractive() {
    this.inputBox = new PIXI.Container()
    this.inputBox.interactive = true
    this.inputBox.hitArea = new PIXI.Rectangle(0, 0, this.size[0], this.size[1])
    this.inputBox.on('pointermove', (event) => {
      this.onPointerMove(event)
    })
    this.inputBox.on('pointerdown', (event) => {
      this.onPointerDown(event)
    })
  }
}
