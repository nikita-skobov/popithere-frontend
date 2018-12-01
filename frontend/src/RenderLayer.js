/* global document */
import * as PIXI from 'pixi.js'

export default class RenderLayer {
  constructor(props) {
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
      this.renderer.backgroundColor = typeof props.backgroundColor === 'number'
        ? props.backgroundColor : 0xffffff
    }

    // everything rendered will go inside root
    this.root = new PIXI.Container()

    if (props.interactive) {
      this.root.interactive = true
      this.root.hitArea = new PIXI.Rectangle(0, 0, this.size[0], this.size[1])
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

    if (typeof props.addToPage === 'undefined') {
      // eslint-disable-next-line
      props.addToPage = true
    }

    if (props.addToPage) {
      // for extra layers just add it to the body
      // but the base layer is part of react, so it should
      // not be added to the page
      this.renderer.view.classList.add('canvas2')
      this.renderer.view.classList.add(this.type)
      this.renderer.view.style.zIndex = this.type === 'input' ? '16' : '15'
      document.body.appendChild(this.renderer.view)

      // set initial position of layer
      const canvas = document.getElementsByClassName('canvas')[0]
      this.renderer.view.style.left = `${canvas.offsetLeft}px`
      this.renderer.view.style.top = `${canvas.offsetTop}px`
      this.renderer.view.style.width = `${canvas.offsetWidth}px`
      this.renderer.view.style.height = `${canvas.offsetHeight}px`
    }
  }

  wipeAll() {
    this.root.destroy(true)
  }

  destroy() {
    this.renderer.destroy(true)
  }

  removeListeners() {
    this.root.interactive = false
  }

  on(event, callback) {
    if (this.root.interactive) {
      this.root.on(event, callback)
    }
  }

  addImage(name, { x, y }) {
    const img = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    img.x = x
    img.y = y
    this.root.addChild(img)
  }

  draw() {
    this.renderer.render(this.root)
  }
}
