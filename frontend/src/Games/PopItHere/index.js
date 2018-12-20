import React from 'react'
import * as PIXI from 'pixi.js'

import Game from '../Game'
import PopItSelection from './PopItSelection'

import { getLocalPosition, calculateCenterPosition } from '../../utils/GameUtils'

export default class PopItHere extends Game {
  constructor(props) {
    super(props)

    this.setBackgroundColor(0xfb2ab4)

    // this.root.on('pointerdown', (event) => {
    //   console.log('pointerdown')
    //   this.modal.toggle({
    //     modal: () => (
    //       <PopItSelection game={this} />
    //     ),
    //   })
    //   this.pointerDown(event)
    // })

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

    this.addButton({
      name: 'endgame',
      text: 'End Game',
      on: () => {
        console.log('ending game')
        this.canvas.endGame()
      },
    })

    this.poppingName = null
    this.draw()

    this.stage = new PIXI.Container()
    this.root.addChild(this.stage)

    this.pointerDown = this.pointerDown.bind(this)
  }

  popItChosen(type, val) {
    if (type === 'image') {
      this.startPopping(val)
      this.root.on('pointerdown', this.pointerDown)
    }
  }

  stopPopping() {
    this.poppingName = null
    this.root.off('pointerdown', this.pointerDown)
  }

  clearCanvas() {
    this.stage.removeChildren()
    if (!this.animating) {
      this.draw()
    }
  }

  setupCustomBuilder() {
    let yOffset = 20
    const xOffset = 12
    const myButtons = []
    const buttonTexts = ['Add Image', 'Add Text']
    buttonTexts.forEach((txt) => {
      const btn = this.addCanvasButton(txt, {
        x: xOffset,
        y: yOffset,
        container: this.stage,
        paddingPercentY: 0.1,
        textAlpha: 1,
      })
      yOffset = btn.y + btn.height + 20
      myButtons.push(btn)
    })

    if (!this.animating) {
      this.draw()
    }
  }

  startPopping(name) {
    this.poppingName = name
  }

  pointerDown(event) {
    console.log('pointer down')
    const clickPos = getLocalPosition(event, this.root)
    if (Array.isArray(this.poppingName)) {
      // if an array of textures, then treat it as a gif
      const { x, y } = calculateCenterPosition(this.poppingName[0], clickPos)
      this.addGif(this.poppingName, { x, y, container: this.stage })
      if (!this.animating) {
        this.animate()
      }
    } else {
      // otherwise, treat it like an image
      const { x, y } = calculateCenterPosition(this.poppingName, clickPos)
      this.addImage(this.poppingName, { x, y, container: this.stage })
      this.draw()
    }
  }
}
