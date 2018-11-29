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
      { preserveDrawinngBuffer: false },
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

    this.stage.interactive = true
    this.stage.hitArea = new PIXI.Rectangle(0, 0, this.size[0], this.size[1])
    this.stage.on('pointermove', (event) => {
      this.onPointerMove(event)
    })
    this.stage.on('pointerdown', (event) => {
      this.onPointerDown(event)
    })
  }

  onPointerDown(event) {
    if (this.currentlyPopping) {
      const { x, y } = event.data.getLocalPosition(this.stage)
      const chat = {
        name: 'test',
        msg: `x:${x}, y:${y}`,
      }
      this.brain.tell.ChatBox.addChat(chat)
      console.log(event.data.getLocalPosition(this.stage))
      this.addImage(this.poppingName, { x, y })
      this.render()
    }
  }

  onPointerMove(event) {
    // console.log(event.data.originalEvent.x, event.data.originalEvent.y)
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
