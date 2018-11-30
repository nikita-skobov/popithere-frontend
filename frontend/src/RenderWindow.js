import * as PIXI from 'pixi.js'

export default class RenderWindow {
  constructor(props) {
    this.defaults = {
      backgroundColor: 0xafa0fb,
      maxSprites: 10,
    }

    this.brain = props.brain
    this.size = props.size
    this.aspectRatio = this.size[0] / this.size[1]
    this.renderer = PIXI.autoDetectRenderer(
      this.size[0],
      this.size[1],
      {
        preserveDrawinngBuffer: false,
      },
    )
    this.renderer.backgroundColor = props.backgroundColor || this.defaults.backgroundColor

    this.stage = new PIXI.Container()
    this.maxSprites = props.maxSprites || this.defaults.maxSprites

    // eslint-disable-next-line
    const oldCanvas = document.getElementsByTagName('canvas')[0]
    this.renderer.view.classList.add('canvas')
    oldCanvas.replaceWith(this.renderer.view)

    this.currentlyPopping = false
    this.poppingName = null

    // creates a seperate renderer element to handle all inputs
    this.inputRenderer = PIXI.autoDetectRenderer(
      this.size[0],
      this.size[1],
      {
        preserveDrawingBuffer: false,
        transparent: true,
      },
    )
    this.inputRenderer.view.classList.add('canvas2')
    this.inputRenderer.view.style.zIndex = '15'
    document.body.appendChild(this.inputRenderer.view)

    // sets up interactivity for the global input box
    this.inputBox = new PIXI.Container()
    this.inputBox.interactive = true
    this.inputBox.hitArea = new PIXI.Rectangle(0, 0, this.size[0], this.size[1])
    this.inputBox.on('pointermove', (event) => {
      this.onPointerMove(event)
    })
    this.inputBox.on('pointerdown', (event) => {
      this.onPointerDown(event)
    })

    // set input renderer initial position
    this.repositionInput()
    // render it once so inputBox detection works
    this.inputRenderer.render(this.inputBox)

    // special resize handler. this way renderWindow
    // does not need to expose itself to brain
    this.brain.onResize((e) => {
      console.log('inside brain resize')
      this.repositionInput()
    })
  }

  repositionInput() {
    this.inputRenderer.view.style.left = `${this.renderer.view.offsetLeft}px`
    this.inputRenderer.view.style.top = `${this.renderer.view.offsetTop}px`
    this.inputRenderer.view.style.width = `${this.renderer.view.offsetWidth}px`
    this.inputRenderer.view.style.height = `${this.renderer.view.offsetHeight}px`
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
