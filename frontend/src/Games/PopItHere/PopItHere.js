import React from 'react'
import * as PIXI from 'pixi.js'

import Game from '../Game'
import PopItSelection from './PopItSelection'

export default class PopItHere extends Game {
  constructor(props) {
    super(props)

    this.setBackgroundColor(0xab1212)

    this.on('pointerdown', (event) => {
      this.pointerDown(event)
    })

    this.addButton({
      name: 'popit',
      text: 'Pop It!',
      on: () => {
        console.log('ya pressed tha button!!!')
      },
      modal: () => (
        <PopItSelection game={this} />
      ),
      modalTitle: 'Choose your PopIt',
    })

    this.currentlyPopping = false
    this.poppingName = null
    this.draw()
  }

  popItChosen(type, val) {
    if (type === 'image') {
      this.startPopping(val)
    }
  }

  startPopping(name) {
    this.poppingName = name
    this.currentlyPopping = true
  }

  // eslint-disable-next-line
  calculatePos(name, clickPos) {
    let width
    let height
    if (typeof name === 'string') {
      ({ width, height } = PIXI.loader.resources[name].texture)
    } else {
      ({ width, height } = name)
    }
    return { x: clickPos.x - (width / 2), y: clickPos.y - (height / 2) }
  }

  pointerDown(event) {
    if (this.currentlyPopping) {
      const clickPos = this.getLocalPosition(event)
      const { x, y } = this.calculatePos(this.poppingName, clickPos)
      this.addImage(this.poppingName, { x, y })
      this.draw()
    }
  }
}
