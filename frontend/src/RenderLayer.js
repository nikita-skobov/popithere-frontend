import * as PIXI from 'pixi.js'

export default class RenderLayer {
  constructor(props) {
    // size: this.size,
    // interactive: false, // default is false
    // backgroundColor: props.backgroundColor, // default is white,
    // transparent: false, // default is false
    // addToPage: false, // default is true
    // type: 'base' || 'input' // default is undefined
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
      // only apply background color if not transparent
      // default is white: 0xffffff
      this.renderer.backgroundColor = props.backgroundColor || 0xffffff
    }

    // by default, no interaction
    this.inputBox = null

    if (props.interactive) {
      this.makeInteractive()
    }

    this.type = props.type
    if (this.type !== 'base' && this.type !== 'input') {
      // when users are making games, they should NOT use base, or input
      // this allows the RenderWindow to remove all canvases
      // where className === extra
      this.type = 'extra'
    }

    if (props.addToPage) {
      // for extra layers just add it to the body
      // but the base layer is part of react, so it should
      // not be added to the page
      this.renderer.view.classList.add('canvas2')
      this.renderer.view.classList.add(this.type)
      this.renderer.view.style.zIndex = '15'
      document.body.appendChild(this.renderer.view)
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
