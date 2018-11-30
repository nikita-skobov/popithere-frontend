import * as PIXI from 'pixi.js'

import PopItHere from './Games/PopItHere'
import RenderLayer from './RenderLayer'

export default class RenderWindow {
  constructor(props) {
    this.defaults = {
      backgroundColor: 0xafa0fb,
      maxSprites: 10,
    }

    this.brain = props.brain
    this.size = props.size
    this.aspectRatio = this.size[0] / this.size[1]

    this.baseLayer = new RenderLayer({
      size: this.size,
      interactive: false, // default is false
      backgroundColor: props.backgroundColor, // default is white,
      transparent: false, // default is false
      addToPage: false, // default is true
      type: 'base', // default is extra
    })

    // base layer needs to be inserted to DOM specially
    this.renderer = this.baseLayer.renderer
    // eslint-disable-next-line
    const oldCanvas = document.getElementsByTagName('canvas')[0]
    this.renderer.view.classList.add('canvas')
    oldCanvas.replaceWith(this.renderer.view)

    this.stage = new PIXI.Container()
    this.maxSprites = props.maxSprites || this.defaults.maxSprites
    this.currentlyPopping = false
    this.poppingName = null

    // creates a seperate renderer element to handle all inputs
    this.inputLayer = new RenderLayer({
      size: this.size,
      interactive: true,
      transparent: true,
      addToPage: true,
      type: 'input',
    })

    // set input renderer initial position
    this.repositionCanvases()
    // render it once so inputBox detection works
    this.inputRenderer = this.inputLayer.renderer

    // special resize handler. this way renderWindow
    // does not need to expose itself to brain
    this.brain.onResize((e) => {
      console.log('inside brain resize')
      this.repositionCanvases()
    })
  }

  repositionCanvases() {
    // class canvas is part of react root,
    // all other canvas2 elements are just part of the body
    // so they need to be resized seperately
    const canvases = document.getElementsByClassName('canvas2')
    Array.prototype.forEach.call(canvases, (el) => {
      const elm = el
      elm.style.left = `${this.renderer.view.offsetLeft}px`
      elm.style.top = `${this.renderer.view.offsetTop}px`
      elm.style.width = `${this.renderer.view.offsetWidth}px`
      elm.style.height = `${this.renderer.view.offsetHeight}px`
    })
  }

  onPointerDown(event) {
    console.log(event)
    if (this.currentlyPopping) {
      const clickPos = event.data.getLocalPosition(this.stage)
      const chat = {
        name: 'test',
        msg: `x:${clickPos.x}, y:${clickPos.y}`,
      }
      this.brain.tell.ChatBox.addChat(chat)
      console.log(event.data.getLocalPosition(this.stage))
      const { x, y } = this.calculatePos(this.poppingName, clickPos)
      this.addImage(this.poppingName, { x, y })
      this.render()
    }
  }
// make a Game class... have different games with different rules
  onPointerMove(event) {
    // console.log(event)
    // console.log(event.data.originalEvent.x, event.data.originalEvent.y)
  }

  // eslint-disable-next-line
  calculatePos(name, clickPos) {
    const { width, height } = PIXI.loader.resources[name].texture
    return { x: clickPos.x - (width / 2), y: clickPos.y - (height / 2) }
  }

  addImage(name, { x, y }) {
    console.log(`drawing ${name}`)
    console.log(x, y)
    const cat = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    cat.x = x
    cat.y = y
    this.stage.addChild(cat)
  }

  startPopping(name) {
    this.poppingName = name
    this.currentlyPopping = true
  }

  donePopping() {
    this.poppingName = null
    this.currentlyPopping = false
  }

  changeGame(name) {
    if (name === 'PopItHere') {
      this.currentGame = new PopItHere({
        baseLayer: this.renderer,
        inputLayer: this.inputRenderer,
      })
    } else {
      // do nothing
    }
  }

  render() {
    const numSprites = this.stage.children.length
    if (numSprites > this.maxSprites) {
      // remove the oldest sprites
      const diff = numSprites - this.maxSprites
      console.log(`removing ${diff} sprites`)
      this.stage.removeChildren(0, diff)
    }
    this.renderer.render(this.stage)
  }

  afterLoad() {
    console.log('Assets loaded!')
    this.render()
    const cat = new PIXI.Sprite(PIXI.loader.resources.test1.texture)
    cat.x = 200
    cat.y = 200
    this.inputBox.addChild(cat)
    this.inputRenderer.render(this.inputBox)

    setTimeout(() => {
      console.log('chaning game:')
      this.changeGame('PopItHere')
    }, 3000)
  }

  changeMaxSprites(newMax) {
    this.maxSprites = newMax
  }

  loadAssets(assetArray, cb) {
    let callback = cb
    if (!callback) {
      callback = this.afterLoad
    }

    PIXI.loader.add(assetArray).load(callback.bind(this))
  }

  getWidth() {
    return this.size[0]
  }

  getHeight() {
    return this.size[1]
  }
}
