import * as PIXI from 'pixi.js'

export default class RenderLayer {
  constructor(props) {
    // size: this.size,
    // interactive: false, // default is false
    // backgroundColor: props.backgroundColor, // default is white,
    // transparent: false, // default is false
    // addToPage: false, // default is true
    // type: 'base' || 'input' // default is extra
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

    // everything rendered will go inside root
    this.root = new PIXI.Container()

    if (props.interactive) {
      this.makeInteractive(true)
    }

    // initial render so it shows up
    this.renderer.render(this.root)

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

  makeInteractive(flag) {
    if (flag) {
      // if flag is true, make it interactive
      if (!this.root) {
        // only create a new input box if one does not exist
        this.root.interactive = true
        this.root.hitArea = new PIXI.Rectangle(0, 0, this.size[0], this.size[1])
      }
    } else if (this.root) {
      // otherwise destroy the current root, and set to null
      // this can be used if you want to disable interactions dynamically
      this.root.destroy(true)
      this.root = null
    }
  }

  on(event, callback) {
    console.log('inside render layer event')
    if (this.root) {
      console.log('input box true')
      this.root.on(event, callback)
    }
  }
}
