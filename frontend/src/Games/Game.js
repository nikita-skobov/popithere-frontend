import * as PIXI from 'pixi.js'

const has = Object.prototype.hasOwnProperty

export default class Game {
  constructor(props) {
    this.renderer = props.renderer
    this.root = props.root
    this.modal = props.modal
    this.uploader = props.uploader
    this.socket = props.socket
    this.canvas = props.canvas
    this.ticker = PIXI.ticker.shared
    this.buttons = []
    this.animating = false

    this.gameIsActive = true

    this.center = { x: this.renderer.width / 2, y: this.renderer.height / 2 }

    this.background = new PIXI.Sprite(PIXI.Texture.EMPTY)
    this.background.customId = 'BACKGROUND'
    this.background.x = 0
    this.background.y = 0
    this.background.width = this.renderer.width
    this.background.height = this.renderer.height
    this.root.addChild(this.background)
    this.draw = this.draw.bind(this)

    this.drawHooks = []
    this.drawHooksActive = false
  }

  setBackgroundColor(color) {
    if (this.gameIsActive) {
      if (typeof color === 'number') {
        let hexString = color.toString(16)
        while (hexString.length < 6) {
          hexString = `0${hexString}`
        }
        this.renderer.view.style.backgroundColor = `#${hexString}`
      } else {
        this.renderer.view.style.backgroundColor = color
      }
      return null
    }
  }

  getButtons() {
    return this.buttons
  }

  addDrawHook(func) {
    if (!this.drawHooksActive) {
      this.drawHooksActive = true
    }
    this.drawHooks.push(func)
  }

  clearDrawHooks() {
    this.drawHooks = []
    this.drawHooksActive = false
  }

  draw(time) {
    this.renderer.render(this.root)
    if (this.drawHooksActive) {
      this.drawHooks.forEach(hook => hook(time))
    }
  }

  animate() {
    if (!this.animating) {
      this.animating = true
      this.ticker.add(this.draw)
    }
  }

  endGame() {
    console.log('other end game called')
    this.animating = false
    this.clearDrawHooks()
    this.ticker.remove(this.draw)
    this.setBackgroundColor('white')
    this.root.interactive = false
    this.root.destroy()
    // this.root.destroy({ children: true, texture: false, baseTexture: false })

    this.renderer.backgroundColor = 0x000000
    this.renderer.clear()
    this.gameIsActive = false
  }

  addGif(textures, { x, y, play = true, atIndex = null, container = this.root }) {
    const anim = new PIXI.extras.AnimatedSprite(textures)
    anim.x = x
    anim.y = y

    if (atIndex === null) {
      container.addChild(anim)
    } else {
      container.addChildAt(anim, atIndex)
    }

    if (play) {
      anim.play()
    }

    return anim
  }

  addCanvasButton(text, {
    x,
    y,
    textAlpha,
    textStyle,
    container = this.root,
    alpha = 0.3,
    lineWidth = 4,
    lineColor = 0x000000,
    buttonColor = 0xffffff,
    radius = 10,
    paddingPercentX = 0.04,
    paddingPercentY = 0.07,
  }) {
    const message = new PIXI.Text(text, textStyle)
    message.alpha = textAlpha || alpha
    const roundBox = new PIXI.Graphics()
    roundBox.lineStyle(lineWidth, lineColor, alpha)
    roundBox.beginFill(buttonColor, alpha)
    const rectWidth = message.width * (1 + (2 * paddingPercentX))
    const rectHeight = message.height * (1 + (2 * paddingPercentY))
    roundBox.drawRoundedRect(0, 0, rectWidth, rectHeight, radius)
    roundBox.endFill()
    roundBox.x = x
    roundBox.y = y
    container.addChild(roundBox)
    message.x = (rectWidth - message.width) / 2
    message.y = (rectHeight - message.height) / 2
    roundBox.addChild(message)

    return roundBox
  }

  addText(txt, { x, y, textStyle, atIndex = null, container = this.root }) {
    const message = new PIXI.Text(txt, textStyle)
    message.x = x
    message.y = y
    if (atIndex === null) {
      container.addChild(message)
    } else {
      container.addChildAt(message, atIndex)
    }

    return message
  }

  addImage(name, { x, y, atIndex = null, container = this.root }) {
    let img
    if (typeof name === 'string') {
      img = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    } else {
      img = new PIXI.Sprite(name)
    }
    img.x = x
    img.y = y
    if (atIndex === null) {
      container.addChild(img)
    } else {
      container.addChildAt(img, atIndex)
    }

    return img
  }

  removeButtons() {
    this.buttons = []
  }

  addButton(btn) {
    // can either be an obj or string
    if (typeof btn === 'string') {
      // if its string then the button name, and text are the same
      this.buttons.push({
        name: btn,
        text: btn,
      })
    } else if (typeof btn === 'object') {
      if (!has.call(btn, 'name')) {
        throw new Error('addButton object must contain a name property')
      }
      if (!has.call(btn, 'text')) {
        throw new Error('addButton object must contain a text property')
      }
      if (typeof btn.name !== 'string') {
        throw new Error('name must be a string')
      }
      if (typeof btn.text !== 'string') {
        throw new Error('text must be a string')
      }

      const obj = {
        name: btn.name,
        text: btn.text,
        notCloseable: btn.notCloseable,
      }

      if (has.call(btn, 'on')) {
        if (typeof btn.on !== 'function') {
          throw new Error('property: "on" must be a function')
        }
        obj.on = btn.on
      }

      // if user supplies a modal property,
      // verify that it is a react function
      if (has.call(btn, 'modal')) {
        if (typeof btn.modal !== 'function') {
          throw new Error('property "modal" must be a function')
        }
        if (!has.call(btn.modal(), '$$typeof')) {
          throw new Error('property: "modal" must return a react component')
        }
        if (btn.modal().$$typeof.toString() !== 'Symbol(react.element)') {
          throw new Error('property: "modal" must return a react component')
        }
        obj.modal = btn.modal

        if (has.call(btn, 'modalTitle')) {
          if (typeof btn.modalTitle !== 'string') {
            throw new Error('property "modalTitle" must be a string')
          }

          obj.modalTitle = btn.modalTitle
        }
      }

      this.buttons.push(obj)
    } else {
      throw new Error('addButton argument must be either a string or object')
    }
  } // end of addButton
}
