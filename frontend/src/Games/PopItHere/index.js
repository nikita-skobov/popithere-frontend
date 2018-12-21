import React from 'react'
import * as PIXI from 'pixi.js'

import Game from '../Game'
import PopItSelection from './PopItSelection'

import { getLocalPosition, calculateCenterPosition, makeRandomId } from '../../utils/GameUtils'

export default class PopItHere extends Game {
  constructor(props) {
    super(props)

    this.popItButton = {
      name: 'popit',
      text: 'Pop It!',
      on: () => {
        console.log('ya pressed tha button!!!')
      },
      modal: () => (
        <PopItSelection game={this} />
      ),
      modalTitle: 'Choose your PopIt',
    }

    this.endGameButton = {
      name: 'endgame',
      text: 'End Game',
      on: () => {
        console.log('ending game')
        this.canvas.endGame()
      },
    }

    this.addButton(this.popItButton)
    this.addButton(this.endGameButton)

    this.poppingName = null

    this.stage = new PIXI.Container()
    this.root.addChild(this.stage)

    this.pointerDown = this.pointerDown.bind(this)
    this.customAddImage = this.customAddImage.bind(this)
    this.customAddText = this.customAddText.bind(this)
    this.customNewImage = this.customNewImage.bind(this)
    this.customClearActiveSprite = this.customClearActiveSprite.bind(this)

    this.animate()

    // this.setBackgroundColor(0x1af22e)
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
  }

  customAddImage(event) {
    console.log('clicked on add image')
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="custom" />
      ),
      modalTitle: 'Choose An Image',
    })
  }

  customAddText(event) {
    console.log('clicked on add tesxt')
  }

  customNewImage(image) {
    if (Array.isArray(image)) {
      console.log('gif')
      const { x, y } = calculateCenterPosition(image[0], this.center)
      const myGif = this.addGif(image, { x, y, container: this.stage })
      myGif.interactive = true
      myGif.customId = makeRandomId(5)
      myGif.on('pointerdown', this.customNewActiveSprite.bind(this, myGif))
      this.activeSprite = myGif
      console.log(myGif.height)
      console.log(myGif.width)
    } else {
      console.log('img')
    }
  }

  customNewActiveSprite(mySprite) {
    if (!this.activeSprite) {
      this.activeSprite = mySprite
      return null
    }
    if (mySprite.customId !== this.activeSprite.customId) {
      this.activeSprite = mySprite
    }
    return null
  }

  customClearActiveSprite() {
    // when clicking anywhere other than a sprite, or a button
    // it should remove any active tools
    this.activeSprite = null
  }

  setupCustomBuilder() {
    this.removeButtons()
    this.addButton(this.endGameButton)
    this.canvas.newButtons(this.getButtons())
    this.buttonLayer = new PIXI.Container()
    this.root.addChild(this.buttonLayer)

    this.activeSprite = null

    this.background.interactive = true
    this.background.on('pointerdown', this.customClearActiveSprite)

    let yOffset = 20
    const xOffset = 12
    const myButtons = []
    const buttonTexts = ['Add Image', 'Add Text']
    buttonTexts.forEach((txt) => {
      const btn = this.addCanvasButton(txt, {
        x: xOffset,
        y: yOffset,
        container: this.buttonLayer,
        paddingPercentY: 0.1,
        textAlpha: 1,
      })
      yOffset = btn.y + btn.height + 20
      btn.interactive = true
      if (txt === 'Add Image') {
        btn.on('pointerdown', this.customAddImage)
      } else if (txt === 'Add Text') {
        btn.on('pointerdown', this.customAddText)
      }
      myButtons.push(btn)
    })
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
    } else {
      // otherwise, treat it like an image
      const { x, y } = calculateCenterPosition(this.poppingName, clickPos)
      this.addImage(this.poppingName, { x, y, container: this.stage })
    }
  }
}
