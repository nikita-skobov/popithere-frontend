import React from 'react'
import * as PIXI from 'pixi.js'

import Game from '../Game'
import PopItSelection from './PopItSelection'

import { getLocalPosition, calculateCenterPosition, makeRandomId, reduceFrames } from '../../utils/GameUtils'

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
    this.maxGifFrames = 60

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
    this.customGifSprites = []
    this.customGifFrameCounter = 0

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

    this.controlLayer.destroy(true)

    this.background.interactive = false
    this.background.off('pointerdown', this.customClearActiveSprite)

    this.customGifSprites.forEach(sprite => sprite.destroy(true))

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
    let myImg
    if (Array.isArray(image)) {
      const { x, y } = calculateCenterPosition(image[0], this.center)
      const newFrames = reduceFrames(image, this.maxGifFrames)
      myImg = this.addGif(newFrames, { x, y, container: this.stage, atIndex: 0, play: false })
      this.customGifSprites.push(myImg)
    } else {
      const { x, y } = calculateCenterPosition(image, this.center)
      myImg = this.addImage(image, { x, y, container: this.stage, atIndex: 0 })
    }

    myImg.interactive = true
    myImg.customId = makeRandomId(8)

    myImg.on('pointerdown', this.customNewActiveSprite.bind(this, myImg))
      .on('pointerup', this.onDragEnd.bind(this, myImg))
      .on('pointerupoutside', this.onDragEnd.bind(this, myImg))
      .on('pointermove', this.onDragMove.bind(this, myImg))

    this.activeSprite = myImg
    if (!this.customControls.visible) {
      // first time an image was added, so add controls to stage
      this.controlLayer.addChild(this.customControls.left)
      this.controlLayer.addChild(this.customControls.bottom)
      this.controlLayer.addChild(this.customControls.right)
      this.controlLayer.addChild(this.customControls.top)
      this.customControls.visible = true
    }

    if (!this.customControls.left.visible) {
      // if one of them is not visible, all are not visible
      // reset visibility to true for newly added sprite
      this.customSetControlVisibility(true)
    }

    this.placeSpriteOnTop(myImg)
    console.log(this.root)
    console.log(this.buttonLayer)
    console.log(this.controlLayer)
    console.log(this.stage)
  }

  onDragEnd(sprite, event) {
    sprite.isDragging = false
    sprite.dragData = null
  }

  onDragMove(sprite) {
    if (sprite.isDragging) {
      const newPos = sprite.dragData.getLocalPosition(this.stage)
      sprite.x = newPos.x - (sprite.width / 2)
      sprite.y = newPos.y - (sprite.height / 2)
    }
  }

  findIndexOfChild(sprite) {
    let index = -1
    this.stage.children.forEach((sp, ind) => {
      if (sp.customId && sp.customId === sprite.customId) {
        index = ind
      }
    })
    return index
  }

  findLastCustomSpriteIndex() {
    let index = -1
    this.stage.children.forEach((sp, ind) => {
      if (sp.customId) {
        index = ind
      }
    })
    return index
  }

  placeSpriteOnTop(sprite) {
    const newIndex = this.findLastCustomSpriteIndex()
    const currentIndex = this.findIndexOfChild(sprite)
    const temp = this.stage.children[newIndex]
    this.stage.children[newIndex] = this.stage.children[currentIndex]
    this.stage.children[currentIndex] = temp
  }

  customNewActiveSprite(mySprite, event) {
    this.placeSpriteOnTop(mySprite)
    mySprite.dragData = event.data
    mySprite.isDragging = true

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

    const circle = new PIXI.Graphics()
    circle.beginFill(lineColor)
    circle.drawEllipse(0, 0, 20, 5)
    circle.endFill()
    circle.x = 0
    circle.y = 0
    const circleTexture = this.renderer.generateTexture(circle)

    const circle2 = new PIXI.Graphics()
    circle2.beginFill(lineColor)
    circle2.drawEllipse(0, 0, 5, 20)
    circle2.endFill()
    circle2.x = 0
    circle2.y = 0
    const circleTexture2 = this.renderer.generateTexture(circle2)

    const onDragStart = (item, event) => {
      item.dragData = event.data
      item.isDragging = true
    }

    const onDragEnd = (item, event) => {
      item.dragData = null
      item.isDragging = false
    }

    const onDragMove = (item, event) => {
      if (item.isDragging) {
        const newPos = item.dragData.getLocalPosition(this.stage)
        item.lastPos = item.lastPos || newPos
        let dir
        let scaleVal

        if (item.customId === 'resizeH' || item.customId === 'resizeH2') {
          scaleVal = item.customId === 'resizeH' ? -0.01 : 0.01
          dir = 'x'
        } else if (item.customId === 'resizeV' || item.customId === 'resizeV2') {
          scaleVal = item.customId === 'resizeV' ? -0.01 : 0.01
          dir = 'y'
        }

        const diff = newPos[dir] - item.lastPos[dir]

        if (diff > 0) {
          this.activeSprite.scale[dir] += scaleVal
        } else if (diff < 0) {
          this.activeSprite.scale[dir] -= scaleVal
        }

        item.lastPos = newPos
      }
    }

    const makeInteractive = (item) => {
      item.interactive = true
      item.on('pointerdown', onDragStart.bind(this, item))
        .on('pointerup', onDragEnd.bind(this, item))
        .on('pointerupoutside', onDragEnd.bind(this, item))
        .on('pointermove', onDragMove.bind(this, item))
    }

    const resizeH = new PIXI.Sprite(circleTexture)
    const resizeH2 = new PIXI.Sprite(circleTexture)

    const resizeV = new PIXI.Sprite(circleTexture2)
    const resizeV2 = new PIXI.Sprite(circleTexture2)

    const bottomSprite = new PIXI.Sprite(texture2)
    const topSprite = new PIXI.Sprite(texture2)
    const leftSprite = new PIXI.Sprite(texture1)
    const rightSprite = new PIXI.Sprite(texture1)

    resizeV.x = 50 - resizeV.width / 2
    resizeV.y = -18

    resizeV2.x = resizeV.x
    resizeV2.y = resizeV.y

    resizeH2.x = -18
    resizeH2.y = 50 - resizeH2.height / 2

    resizeH.x = -18
    resizeH.y = 50 - resizeH.height / 2

    resizeH.customId = 'resizeH'
    resizeH2.customId = 'resizeH2'
    resizeV.customId = 'resizeV'
    resizeV2.customId = 'resizeV2'

    makeInteractive(resizeH)
    makeInteractive(resizeH2)
    makeInteractive(resizeV)
    makeInteractive(resizeV2)

    leftSprite.addChild(resizeH)
    rightSprite.addChild(resizeH2)
    topSprite.addChild(resizeV)
    bottomSprite.addChild(resizeV2)

    return {
      visible: false,
      left: leftSprite,
      top: topSprite,
      right: rightSprite,
      bottom: bottomSprite,
    }
  }

  customPreDraw(timeDelta) {
    if (this.customGifSprites.length) {
      this.customGifSprites.forEach(sprite => sprite.gotoAndPlay(this.customGifFrameCounter))
      this.customGifFrameCounter += 1
      if (this.customGifFrameCounter >= this.maxGifFrames) this.customGifFrameCounter = 0
    }
    if (this.activeSprite) {
      this.customAlignControls()
    }
  }

  setupCustomBuilder() {
    this.removeButtons()
    this.addButton(this.endGameButton)
    this.canvas.newButtons(this.getButtons())

    this.controlLayer = new PIXI.Container()
    this.root.addChild(this.controlLayer)

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
      btn.buttonMode = true
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
