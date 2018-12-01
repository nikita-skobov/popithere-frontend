import * as PIXI from 'pixi.js'

import LayerName from './LayerName'

import RenderLayer from '../RenderLayer'

const has = Object.prototype.hasOwnProperty

export default class Game {
  constructor(props) {
    this.baseLayer = props.baseLayer
    this.inputLayer = props.inputLayer
    this.size = props.size
    this.modal = props.modal

    this.buttons = []
    this.layers = {
      base: this.baseLayer,
    }

    this.defaultLayer = new LayerName('base')
  }

  getButtons() {
    return this.buttons
  }

  getLocalPosition(event) {
    return event.data.getLocalPosition(this.inputLayer.root)
  }

  addImage(name, pos, layer = this.defaultLayer) {
    if (this.layerExists(layer)) {
      this.layers[layer.name].addImage(name, pos)
    } else {
      throw new Error(`cannot add image to layer: ${layer.name}. it does not exist`)
    }
  }

  addLayer(name, opts) {
    const opts2 = opts

    if (typeof name !== 'string') {
      throw new Error('must provide a name for the layer')
    }

    if (has.call(this.layers, name)) {
      throw new Error(`layer: ${name} already exists`)
    }

    // set defaults for user
    opts2.size = this.size
    opts2.interactive = false
    this.layers[name] = new RenderLayer(opts2)
    return new LayerName(name)
  }

  layerExists(layerObj) {
    console.log(layerObj instanceof LayerName)
    if (layerObj instanceof LayerName) {
      return has.call(this.layers, layerObj.name)
    }
    throw new Error('Must use a LayerName object, not a string!')
  }

  draw(layer = this.defaultLayer) {
    if (this.layerExists(layer)) {
      this.layers[layer.name].draw()
    } else {
      throw new Error(`cannot draw layer: ${layer.name}. it does not exist`)
    }
  }

  on(event, callback) {
    this.inputLayer.on(event, (e) => {
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
