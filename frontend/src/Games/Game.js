import * as PIXI from 'pixi.js'

const has = Object.prototype.hasOwnProperty

export default class Game {
  constructor(props) {
    this.renderer = props.renderer
    this.root = props.root
    this.modal = props.modal
    this.ticker = PIXI.ticker.shared
    this.buttons = []
    this.animating = false

    this.draw = this.draw.bind(this)
  }

  setBackgroundColor(color) {
    const { renderer, root } = this
    renderer.backgroundColor = color
    renderer.render(root)
  }

  getButtons() {
    return this.buttons
  }

  draw(time) {
    this.renderer.render(this.root)
  }

  animate() {
    this.animating = true
    this.ticker.add(this.draw)
  }

  endGame() {
    this.root.removeAllListeners()
    this.root.removeChildren()

    this.renderer.backgroundColor = 0x000000
    this.renderer.clear()

    this.ticker.remove(this.draw)
    this.animating = false
  }

  addGif(textures, { x, y }) {
    const anim = new PIXI.extras.AnimatedSprite(textures)
    anim.x = x
    anim.y = y
    this.root.addChild(anim)
    anim.play()
  }

  addImage(name, { x, y }) {
    let img
    if (typeof name === 'string') {
      img = new PIXI.Sprite(PIXI.loader.resources[name].texture)
    } else {
      img = new PIXI.Sprite(name)
    }
    img.x = x
    img.y = y
    this.root.addChild(img)
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
