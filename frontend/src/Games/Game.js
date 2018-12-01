const has = Object.prototype.hasOwnProperty

export default class Game {
  constructor(props) {
    this.baseLayer = props.baseLayer
    this.inputHandler = props.inputHandler
    this.size = props.size
    this.modal = props.modal

    this.buttons = []

    // when game resets it removes interactions,
    // set to true for each new game instance
    this.inputHandler.toggleInteractions(true)
  }

  endGame() {
    this.baseLayer.stopAnimating()
    this.baseLayer.renderer.backgroundColor = 0x000000
    this.baseLayer.renderer.clear()
    this.inputHandler.toggleInteractions(false)
  }

  getButtons() {
    return this.buttons
  }

  getLocalPosition(event) {
    return this.inputHandler.getLocalPosition(event)
  }

  setBackgroundColor(color) {
    const { renderer } = this.baseLayer
    renderer.backgroundColor = color
    renderer.render(this.baseLayer.root)
  }

  addImage(name, pos) {
    this.baseLayer.addImage(name, pos)
  }

  draw() {
    this.baseLayer.draw()
  }

  on(event, callback) {
    this.inputHandler.on(event, (e) => {
      callback(e)
    })
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
