import React from 'react'
import * as PIXI from 'pixi.js'

import Game from '../Game'
import PopItSelection from './PopItSelection'

import { getLocalPosition, calculateCenterPosition } from '../../utils/GameUtils'

export default class PopItHere extends Game {
  constructor(props) {
    super(props)

    this.setBackgroundColor(0xfb2ab4)

    this.root.on('pointerdown', (event) => {
      console.log('pointerdown')
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

  pointerDown(event) {
    if (this.currentlyPopping) {
      const clickPos = getLocalPosition(event, this.root)
      if (Array.isArray(this.poppingName)) {
        // if an array of textures, then treat it as a gif
        const { x, y } = calculateCenterPosition(this.poppingName[0], clickPos)
        this.addGif(this.poppingName, { x, y })
        if (!this.animating) {
          this.animate()
        }
      } else {
        // otherwise, treat it like an image
        const { x, y } = calculateCenterPosition(this.poppingName, clickPos)
        this.addImage(this.poppingName, { x, y })
        this.draw()
      }
    }
  }
}
