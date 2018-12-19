/* global document */
import * as PIXI from 'pixi.js'

import PopItHere from './Games/PopItHere/PopItHere'
import RenderLayer from './RenderLayer'
import InputHandler from './Games/InputHandler'

export default class RenderWindow {
  constructor(props) {
    this.brain = props.brain
    this.size = props.size

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
    const oldCanvas = document.getElementsByTagName('canvas')[0]
    this.renderer.view.classList.add('canvas')
    oldCanvas.parentElement.replaceChild(this.renderer.view, oldCanvas)

    // creates a seperate renderer element to handle all inputs
    this.inputLayer = new RenderLayer({
      size: this.size,
      interactive: true,
      transparent: true,
      addToPage: true,
      type: 'input',
    })

    this.inputHandler = new InputHandler({
      inputLayer: this.inputLayer,
    })

    // special resize handler. this way renderWindow
    // does not need to expose itself to brain
    this.brain.onResize(() => {
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

  changeGame(name) {
    // pass all necessary data, and object instances
    // to the Game instance so it can only use what is given to it
    const constructorOps = {
      baseLayer: this.baseLayer,
      size: this.size,
      inputHandler: {
        on: this.inputHandler.on,
        getLocalPosition: this.inputHandler.getLocalPosition,
        toggleInteractions: this.inputHandler.toggleInteractions,
        removeAllListeners: this.inputHandler.removeAllListeners,
      },
      modal: {
        // for example here we only want the Game instance
        // to have access to isOpen and toggle. we don't want
        // to give Game access to setState, render, etc.
        isOpen: this.brain.ask.MyModal.isOpen,
        toggle: this.brain.ask.MyModal.toggle,
      },
    }
    if (name === 'PopItHere') {
      this.currentGame = new PopItHere(constructorOps)
    } else {
      // do nothing
    }
    this.brain.tell.Canvas.newGame(this.currentGame)
  }

  afterLoad() {
    console.log('Assets loaded!')

    setTimeout(() => {
      console.log('chaning game:')
      this.changeGame('PopItHere')
    }, 2000)
  }

  loadAssets(assetArray, cb) {
    let callback = cb
    if (!callback) {
      callback = this.afterLoad
    }

    PIXI.loader.add(assetArray).load(callback.bind(this))
  }
}
