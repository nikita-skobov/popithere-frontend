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
    this.currentlyPopping = false

    this.stage = new PIXI.Container()
    this.root.addChild(this.stage)

    this.pointerDown = this.pointerDown.bind(this)
    this.customAddImage = this.customAddImage.bind(this)
    this.customCancel = this.customCancel.bind(this)
    this.customEnd = this.customEnd.bind(this)
    this.customAddText = this.customAddText.bind(this)
    this.customNewImage = this.customNewImage.bind(this)
    this.customPreDraw = this.customPreDraw.bind(this)
    this.customClearActiveSprite = this.customClearActiveSprite.bind(this)

    this.animate()

    // this.setBackgroundColor(0x1af22e)
  }

  popItChosen(type, val) {
    if (type === 'image') {
      this.startPopping(val)
    }
    if (!this.currentlyPopping) {
      // only register event callback once
      this.currentlyPopping = true
      this.root.on('pointerdown', this.pointerDown)
    }
  }

  stopPopping() {
    this.currentlyPopping = false
    this.poppingName = null
    this.root.off('pointerdown', this.pointerDown)
  }

  clearCanvas() {
    this.stage.removeChildren()
  }

  customAddImage(event) {
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="custom" />
      ),
      modalTitle: 'Choose An Image',
    })
  }

  customCancel() {
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="cancel" />
      ),
      modalTitle: 'Are you sure you want to discard your popit creation?',
    })
  }

  customEnd() {
    this.clearDrawHooks()
    this.buttonLayer.destroy(true)
    this.background.interactive = false
    this.background.off('pointerdown', this.customClearActiveSprite)
    this.clearCanvas()
    this.removeButtons()
    this.addButton(this.popItButton)
    this.addButton(this.endGameButton)
    this.canvas.newButtons(this.getButtons())
    this.buttonLayer = null
    this.customControls = null
    this.activeSprite = null
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
      if (!this.customControls.visible) {
        // first time an image was added, so add controls to stage
        this.stage.addChild(this.customControls.left)
        this.stage.addChild(this.customControls.bottom)
        this.stage.addChild(this.customControls.right)
        this.stage.addChild(this.customControls.top)
        this.customControls.visible = true
      }

      if (!this.customControls.left.visible) {
        // if one of them is not visible, all are not visible
        // reset visibility to true for newly added sprite
        this.customSetControlVisibility(true)
      }
      console.log(myGif.height)
      console.log(myGif.width)
    } else {
      console.log('img')
    }
  }

  customNewActiveSprite(mySprite) {
    if (!this.activeSprite) {
      this.activeSprite = mySprite
      this.customSetControlVisibility(true)
      return null
    }
    if (mySprite.customId !== this.activeSprite.customId) {
      this.activeSprite = mySprite
      this.customSetControlVisibility(true)
    }
    return null
  }

  customSetControlVisibility(bool) {
    this.customControls.left.visible = bool
    this.customControls.top.visible = bool
    this.customControls.right.visible = bool
    this.customControls.bottom.visible = bool
  }

  customClearActiveSprite() {
    // when clicking anywhere other than a sprite, or a button
    // it should remove any active controls
    this.activeSprite = null
    this.customSetControlVisibility(false)
  }

  customAlignControls() {
    const { customControls, activeSprite } = this
    const controls = customControls
    const offSet = 10
    controls.left.x = activeSprite.x - offSet
    controls.left.y = activeSprite.y - offSet
    controls.left.height = activeSprite.height + (2 * offSet)

    controls.top.x = activeSprite.x - offSet
    controls.top.y = activeSprite.y - offSet
    controls.top.width = activeSprite.width + (2 * offSet)

    // -4 at the end because thats the width of the line
    controls.right.x = activeSprite.x + activeSprite.width + offSet - 4
    controls.right.y = activeSprite.y - offSet
    controls.right.height = activeSprite.height + (2 * offSet)

    controls.bottom.x = activeSprite.x - offSet
    controls.bottom.y = activeSprite.y + activeSprite.height + offSet - 4
    controls.bottom.width = activeSprite.width + (2 * offSet)
  }

  customCreateControls() {
    const line = new PIXI.Graphics()
    const lineWidth = 4
    const lineColor = 0x000000
    line.lineStyle(lineWidth, lineColor, 1)
    line.moveTo(0, 0)
    line.lineTo(0, 100)
    line.x = 0
    line.y = 0
    const texture1 = this.renderer.generateTexture(line)
    const line2 = new PIXI.Graphics()
    line2.lineStyle(lineWidth, lineColor, 1)
    line2.moveTo(0, 0)
    line2.lineTo(100, 0)
    line2.x = 0
    line2.y = 0
    const texture2 = this.renderer.generateTexture(line2)
    return {
      visible: false,
      left: new PIXI.Sprite(texture1),
      top: new PIXI.Sprite(texture2),
      right: new PIXI.Sprite(texture1),
      bottom: new PIXI.Sprite(texture2),
    }
  }

  customPreDraw(timeDelta) {
    if (this.activeSprite) {
      this.customAlignControls()
    }
  }

  setupCustomBuilder() {
    this.removeButtons()
    this.addButton(this.endGameButton)
    this.canvas.newButtons(this.getButtons())
    this.buttonLayer = new PIXI.Container()
    this.root.addChild(this.buttonLayer)

    this.customControls = this.customCreateControls()
    this.activeSprite = null
    this.addDrawHook(this.customPreDraw)

    this.background.interactive = true
    this.background.on('pointerdown', this.customClearActiveSprite)

    let yOffset = 20
    const xOffset = 12
    const myButtons = []
    const buttonTexts = ['Add Image', 'Add Text', 'Cancel']
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
      } else if (txt === 'Cancel') {
        btn.on('pointerdown', this.customCancel)
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
