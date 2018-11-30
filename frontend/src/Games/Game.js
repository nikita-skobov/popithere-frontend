const has = Object.prototype.hasOwnProperty

export default class Game {
  constructor(props) {
    console.log('inside game cosntructor')
    console.log(props)
    this.baseLayer = props.baseLayer
    this.inputLayer = props.inputLayer

    this.buttons = []
  }

  getButtons() {
    return this.buttons
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
      this.buttons.push({
        name: btn.name,
        text: btn.text,
      })
    } else {
      throw new Error('addButton argument must be either a string or object')
    }
  }
}
