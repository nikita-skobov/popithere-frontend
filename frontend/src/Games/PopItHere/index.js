import React from 'react'
import * as PIXI from 'pixi.js'

import Game from '../Game'
import PopItSelection from './PopItSelection'

import { getRealPosition, positionToString } from '../../utils/positionParser'
import { createImage } from '../../utils/PixiUtils'
import { getLocalPosition, calculateCenterPosition, makeRandomId, reduceFrames } from '../../utils/GameUtils'

const has = Object.prototype.hasOwnProperty

const coolColor = (colorArr, direction, nonFixed) => {
  let dir = direction
  const arr = colorArr
  arr[nonFixed] += dir // modify color value slightly
  const tooBig = arr[nonFixed] >= 255
  const tooSmall = arr[nonFixed] < 0
  if (tooBig || tooSmall) {
    if (tooSmall) arr[nonFixed] = 0
    else if (tooBig) arr[nonFixed] = 255
    // switch to the next color value
    nonFixed += 1
    dir = -dir // direction must be flipped
    if (nonFixed >= arr.length) {
      // if we are on b, then go back to r
      nonFixed = 0
    }
  }
  return { arr, dir, nonFixed }
}

const getColorFromArray = arr => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`

export default class PopItHere extends Game {
  constructor(props) {
    super(props)

    this.popItButton = {
      name: 'popit',
      text: 'Pop It!',
      on: () => {
        console.log('ya pressed tha button!!!')
        this.previewImages = this.sortBaseX(this.previewImages, 'name', 32)
      },
      modal: () => (
        <PopItSelection game={this} />
      ),
      modalTitle: 'Choose your PopIt',
    }

    // this.endGameButton = {
    //   name: 'endgame',
    //   text: 'End Game',
    //   on: () => {
    //     console.log('ending game')
    //     this.canvas.endGame()
    //   },
    // }

    this.addButton(this.popItButton)
    // this.addButton(this.endGameButton)

    const initialFetchLimit = 10
    let dataNumbers = this.dataMan.getDataNumbers()
    this.dataNumbers = this.sortBaseX(dataNumbers, undefined, 32, initialFetchLimit)

    this.textures = {}
    this.previewImages = []
    this.loadTextures()

    this.poppingName = null
    this.currentlyPopping = false
    this.maxGifFrames = 60

    this.stage = new PIXI.Container()
    this.root.addChild(this.stage)

    this.pointerDown = this.pointerDown.bind(this)
    this.emitPopIt = this.emitPopIt.bind(this)
    this.onPopIt = this.onPopIt.bind(this)
    this.popItChosenLive = this.popItChosenLive.bind(this)
    this.stopPoppingLive = this.stopPoppingLive.bind(this)
    this.reloadTextures = this.reloadTextures.bind(this)

    // config for custom build mode
    this.customBuildMode = false
    this.customAddImage = this.customAddImage.bind(this)
    this.customRotate = this.customRotate.bind(this)
    this.customResize = this.customResize.bind(this)
    this.customCopy = this.customCopy.bind(this)
    this.customDelete = this.customDelete.bind(this)
    this.customPrePreview = this.customPrePreview.bind(this)
    this.customPreview = this.customPreview.bind(this)
    this.customToggleControls = this.customToggleControls.bind(this)
    this.customButtons = {}
    this.customCancel = this.customCancel.bind(this)
    this.customEnd = this.customEnd.bind(this)
    this.customAddText = this.customAddText.bind(this)
    this.customNewImage = this.customNewImage.bind(this)
    this.customPreDraw = this.customPreDraw.bind(this)
    this.customClearActiveSprite = this.customClearActiveSprite.bind(this)
    this.customGifSprites = []
    this.customGifFrameCounter = 0

    this.animate()

    // only continue changing background color if we are not in
    // build mode
    const conditionCallback = () => !this.customBuildMode
    this.changeBackgroundColor([255, 0, 0], 1, 2, 100, conditionCallback.bind(this))

    this.setupLivePopping()


    this.socket.on('REMOVE', (textureName) => {
      console.log(`REMOVING TEXTURE: ${textureName}`)
      if (this.hasTexture(textureName)) {
        this.textures[textureName] = [PIXI.loader.resources[this.placeholder.name]]
      }

      this.previewImages.forEach((obj) => {
        if (obj.name === textureName) {
          obj.url = this.placeholder.url
        }
      })
    })
  }

  static endGame() {
    console.log('end game called!!!')
    this.stage.destroy()
    this.root.off('pointerdown', this.emitPopIt)
    this.root.off('pointerdown', this.pointerDown)
    super.endGame()
  }

  sortBaseX(arr, keyName = false, base = 32, limit = -1, direction = '+') {
    let tempArr = arr
    tempArr = tempArr.map((item) => {
      if (keyName) {
        item[keyName] = parseInt(item[keyName], base)
      } else {
        item = parseInt(item, base)
      }
      return item
    })
    if (direction === '+') {
      tempArr = tempArr.sort((a, b) => keyName ? a[keyName] - b[keyName] : a - b)
    } else {
      tempArr = tempArr.sort((a, b) => keyName ? a[keyName] - b[keyName] : a + b)
    }
    if (limit > -1) {
      tempArr = tempArr.slice(0, limit)
    }
    tempArr = tempArr.map((item) => {
      if (keyName) {
        item[keyName] = item[keyName].toString(base)
      } else {
        item = item.toString(base)
      }
      return item
    })
    return tempArr
  }

  loadTextures(iterator = this.dataNumbers) {
    iterator.forEach((num) => {
      this.dataMan.getDataLater(num, (err, data) => {
        const hasTexture = this.hasTexture(num)
        if (!hasTexture) {
          this.buildTextureAndPreview(num, data)
        }
      })
    })
  }

  reloadTextures(reactElement) {
    this.dataMan.fetchList(() => {
      const newNumbers = this.dataMan.getDataNumbers()
      const appendNumbers = []
      newNumbers.forEach((num) => {
        if (this.dataNumbers.indexOf(num) === -1) {
          appendNumbers.push(num)
        }
      })
      if (appendNumbers.length) {
        this.dataNumbers = [...this.dataNumbers, ...newNumbers]
        this.loadTextures(appendNumbers)
      }
      // I think its better to set state guaranateed after a certain time
      // instead of waiting for all textures to be loaded. you never know
      // there might be a network error, or something, and that would make the
      // modal stuck. this way it is guaranteed to come back
      const timeout = 500
      setTimeout(() => {
        reactElement.setState({ ready: true, loopArray: [...this.sortBaseX(this.previewImages, 'name', 32)], isLoading: false })
      }, timeout)
    })
  }

  setupLivePopping() {
    this.socket.on('po', this.onPopIt)
  }

  changeBackgroundColor(colorArr, direction, nonFixedVal, delay, conditionCallback) {
    const val = getColorFromArray(colorArr)
    this.setBackgroundColor(val)
    const { arr, dir, nonFixed } = coolColor(colorArr, direction, nonFixedVal)
    if (conditionCallback()) {
      setTimeout(() => {
        this.changeBackgroundColor(arr, dir, nonFixed, delay, conditionCallback)
      }, delay)
    }
  }

  popItChosenLive(name) {
    // the live version of popItChosen
    this.poppingName = name
    if (!this.currentlyPopping) {
      this.currentlyPopping = true
      this.root.on('pointerdown', this.emitPopIt)
    }
  }

  stopPoppingLive() {
    this.poppingName = null
    this.currentlyPopping = false
    this.root.off('pointerdown', this.emitPopIt)
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

  customPrePreview(event, title = 'Preview Setup', choice = 'preview') {
    // function that toggles a modal to ask user about max size before generating texture(s)
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice={choice} />
      ),
      notCloseable: true,
      modalTitle: title,
    })
  }

  customPreview(userVal, callback, choice) {
    if (!callback) {
      callback = () => {}
    }
    this.customPreviewMode = true
    this.controlLayer.visible = false
    this.buttonLayer.visible = false

    // scale the stage down so when user pops their new image
    // theyll see that it doesnt pop to the whole page.
    // while creating a custom popit, it might seem that your creation
    // would cover the whole screen, but thats not the case
    let scaleFactor = (userVal * 0.3 / 100)
    scaleFactor = scaleFactor <= 0.01 ? 0.01 : scaleFactor // prevents a 0 scale
    const previousScales = { x: this.stage.scale.x, y: this.stage.scale.y }
    this.stage.scale.x = scaleFactor
    this.stage.scale.y = scaleFactor
    const rectSize = 1024 * scaleFactor
    // rectangle is specified so that this new texture isnt the size of
    // the entire canvas
    const rect = new PIXI.Rectangle(0, 0, rectSize, rectSize)

    // this gives time for the visibility to take effect
    setTimeout(async () => {
      let newTextures
      if (this.customGifSprites.length) {
        // if there are any gifs, you must first create a new
        // animated sprite from all of the frames
        newTextures = []
        const iterator = [...Array(this.maxGifFrames).keys()]

        iterator.forEach((ind) => {
          this.customGifSprites.forEach(sprite => sprite.gotoAndStop(ind))
          newTextures.push(this.renderer.generateTexture(this.stage, undefined, undefined, rect))
        })
      } else {
        // otherwise create a single sprite from a single frame
        newTextures = this.renderer.generateTexture(this.stage, undefined, undefined, rect)
      }
      this.stage.children.forEach((child) => {
        // make all sprites invisible after generating texture
        // so when user starts popping, they will only see their new
        // finalized image
        child.visible = false
      })

      // keeps changing background color as long as we are in customPreviewMode
      const conditionCallback = () => this.customPreviewMode
      this.changeBackgroundColor([255, 0, 0], 1, 2, 100, conditionCallback.bind(this))

      const childIndexBeforePopping = this.stage.children.length
      this.popItChosen('image', newTextures)
      // reset scale for drawing
      this.stage.scale.x = previousScales.x
      this.stage.scale.y = previousScales.y

      const tempButtonLayer = new PIXI.Container()
      this.root.addChild(tempButtonLayer)

      callback(this.modal.isOpen()) // notifies modal that the preview mode is ready

      let dataArr
      if (Array.isArray(newTextures)) {
        dataArr = newTextures.map(txt => this.renderer.plugins.extract.base64(txt))
      } else {
        dataArr = [this.renderer.plugins.extract.base64(newTextures)]
      }

      this.uploader.storeData('myo-data', dataArr)

      let goBack
      const goSubmit = () => {
        const gb2 = goBack.bind(this)
        this.uploader.uploadData('myo-data', gb2)
      }

      goBack = (err) => {
        let actualErr = err
        if (err && has.call(err, 'type') && err.type === 'pointerdown') {
          // this means they just clicked the back button, err is a single
          // argument that can either be an actual error, or a pointerdown event
          actualErr = false
        }
        if (actualErr) {
          console.log(actualErr)
          // if there was an error submitting, then dont leave the preview mode.
          // user should decide on their own if they want to leave preview mode.
          return null
        }
        if (err === false && typeof err === 'boolean') {
          // this means the user just submitted a popit without an error,
          // we will ask the user if they want to go back, or keep
          // editing their popit
          setTimeout(() => {
            this.customCancel(null, 'Go back to home page?')
          }, 500)
        }
        this.uploader.clearData('myo-data')
        // resets everything to how it was prior to starting preview mode
        const ind = this.root.getChildIndex(tempButtonLayer)
        this.root.removeChildAt(ind)
        tempButtonLayer.destroy(true)
        this.stopPopping()
        this.controlLayer.visible = true
        this.buttonLayer.visible = true
        if (childIndexBeforePopping !== this.stage.children.length) {
          this.stage.removeChildren(childIndexBeforePopping, this.stage.children.length)
        }

        if (Array.isArray(newTextures)) {
          // destroy each texture individually
          newTextures.forEach(texture => texture.destroy(true))
        } else {
          // its a single texture
          newTextures.destroy(true)
        }

        this.stage.children.forEach((child) => {
          // resets visibility on all user added sprites from before
          child.visible = true
        })
        this.customPreviewMode = undefined

        setTimeout(() => {
          this.setBackgroundColor('white')
        }, 100)
      }

      // create 2 buttons: back and submit so user can
      // exit preview mode
      let yOffset = 20
      const xOffset = 12
      const textStyle = { fontSize: 40 }
      const buttonTexts = ['Back', 'Submit']
      buttonTexts.forEach((txt) => {
        const btn = this.addCanvasButton(txt, {
          x: xOffset,
          y: yOffset,
          textStyle,
          container: tempButtonLayer,
          paddingPercentY: 0.1,
          textAlpha: 1,
        })
        yOffset = btn.y + btn.height + 20
        btn.interactive = true
        btn.buttonMode = true
        if (txt === 'Back') {
          btn.on('pointerdown', goBack)
        } else if (txt === 'Submit') {
          btn.on('pointerdown', goSubmit)
        }
      })
      // this gives time for the visibility to take effect
    }, 2000)
  }

  customToggleControls() {
    this.customControls.toggle = !this.customControls.toggle
    const bool = this.customControls.toggle
    Object.keys(this.customControls).forEach((key) => {
      if (key !== 'visible' && key !== 'toggle') {
        this.customControls[key].visible = bool
      }
    })
  }

  customDelete() {
    const id = this.activeSprite.customId
    let gifIndex = -1
    this.customGifSprites.forEach((sprite, index) => {
      if (sprite.customId === id) {
        gifIndex = index
      }
    })
    if (gifIndex >= 0) {
      this.customGifSprites.splice(gifIndex, 1)
    }
    const index = this.stage.getChildIndex(this.activeSprite)
    this.stage.removeChildAt(index)
    this.customClearActiveSprite()
  }

  customCopy() {
    let newSprite
    if (has.call(this.activeSprite, 'animationSpeed')) {
      // it is an animated sprite
      const textures = [...this.activeSprite._textures]
      newSprite = this.addGif(textures, { x: this.center.x, y: this.center.y, container: this.stage, atIndex: this.stage.children.length, play: false })
      this.customGifSprites.push(newSprite)
    } else {
      // it is a regular sprite
      const texture = this.activeSprite._texture
      newSprite = this.addImage(texture, { x: this.center.x, y: this.center.y, container: this.stage, atIndex: this.stage.children.length })
    }
    newSprite.interactive = true
    newSprite.anchor.set(0.5, 0.5)
    newSprite.position.set(this.center.x, this.center.y)
    newSprite.customId = `${this.activeSprite.customId}_copy_${makeRandomId(8)}`
    newSprite.rotation = this.activeSprite.rotation
    newSprite.scale.x = this.activeSprite.scale.x
    newSprite.scale.y = this.activeSprite.scale.y

    newSprite.on('pointerdown', this.customNewActiveSprite.bind(this, newSprite))
      .on('pointerup', this.onDragEnd.bind(this, newSprite))
      .on('pointerupoutside', this.onDragEnd.bind(this, newSprite))
      .on('pointermove', this.onDragMove.bind(this, newSprite))

    this.activeSprite = newSprite
  }

  customRotate() {
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="rotate" />
      ),
      modalTitle: 'Rotation',
    })
  }

  customResize() {
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="resize" />
      ),
      modalTitle: 'Resize',
    })
  }

  customAddImage(event) {
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="custom" />
      ),
      notCloseable: true,
      modalTitle: 'Choose An Image',
    })
  }

  customCancel(event, title = 'Are you sure you want to discard your popit creation?') {
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="cancel" />
      ),
      modalTitle: title,
    })
  }

  customEnd() {
    this.customBuildMode = false
    const conditionCallback = () => !this.customBuildMode
    this.changeBackgroundColor([255, 0, 0], 1, 2, 100, conditionCallback.bind(this))
    this.clearDrawHooks()
    this.clearCanvas()
    this.buttonLayer.removeChildren()
    this.controlLayer.removeChildren()
    this.root.removeChildren()
    this.root.addChild(this.background)
    this.root.addChild(this.stage)

    this.background.interactive = false
    this.background.off('pointerdown', this.customClearActiveSprite)

    this.customGifSprites.forEach((sprite) => {
      try {
        sprite.destroy(true)
      } catch (e) {
        // do nothing
      }
    })

    this.customGifSprites = []

    this.removeButtons()
    this.addButton(this.popItButton)
    // this.addButton(this.endGameButton)
    this.canvas.newButtons(this.getButtons())
    this.buttonLayer = undefined
    this.controlLayer = undefined
    this.customControls = undefined
    this.activeSprite = undefined

    this.setupLivePopping()
  }

  customAddText(event) {
    this.modal.toggle({
      modal: () => (
        <PopItSelection game={this} startingChoice="text" />
      ),
      modalTitle: 'Add Text',
    })
  }

  customNewImage(image, type, opts) {
    // opts are a special case, only used for addText
    let myImg
    if (type === 'text') {
      // in this case, 'image' is a text string
      myImg = this.addText(image, { x: 0, y: 0, container: this.stage, atIndex: this.stage.children.length, textStyle: opts })
    } else if (Array.isArray(image)) {
      const { x, y } = calculateCenterPosition(image[0], this.center)
      const newFrames = reduceFrames(image, this.maxGifFrames)
      myImg = this.addGif(newFrames, { x, y, container: this.stage, atIndex: this.stage.children.length, play: false })
      this.customGifSprites.push(myImg)
      if (myImg.width > this.renderer.width || myImg.height > this.renderer.height) {
        // scale down gif to fit canvas
        // find which of the directions is the largest
        const biggestDir = myImg.width > myImg.height ? 'width' : 'height'
        const scaleFactor = this.renderer[biggestDir] / myImg[biggestDir]
        // then apply scale to both width and height
        myImg.width *= scaleFactor
        myImg.height *= scaleFactor
      }
    } else {
      const { x, y } = calculateCenterPosition(image, this.center)
      myImg = this.addImage(image, { x, y, container: this.stage, atIndex: this.stage.children.length })
      if (myImg.width > this.renderer.width || myImg.height > this.renderer.height) {
        // scale down image to fit canvas
        // find which of the directions is the largest
        const biggestDir = myImg.width > myImg.height ? 'width' : 'height'
        const scaleFactor = this.renderer[biggestDir] / myImg[biggestDir]
        // then apply scale to both width and height
        myImg.width *= scaleFactor
        myImg.height *= scaleFactor
      }
    }

    myImg.interactive = true
    myImg.anchor.set(0.5, 0.5)
    myImg.position.set(this.center.x, this.center.y)
    myImg.customId = makeRandomId(8)

    myImg.on('pointerdown', this.customNewActiveSprite.bind(this, myImg))
      .on('pointerup', this.onDragEnd.bind(this, myImg))
      .on('pointerupoutside', this.onDragEnd.bind(this, myImg))
      .on('pointermove', this.onDragMove.bind(this, myImg))

    this.activeSprite = myImg
    if (!this.customControls.visible) {
      // first time an image was added, so add controls to stage
      Object.keys(this.customControls).forEach((key) => {
        if (key !== 'visible' && key !== 'toggle') {
          this.controlLayer.addChild(this.customControls[key])
        }
      })
      this.customControls.visible = true
      this.customSetControlVisibility(true)
    }

    if (!this.customControls.left.visible) {
      // if one of them is not visible, all are not visible
      // reset visibility to true for newly added sprite
      this.customSetControlVisibility(true)
    }
  }

  onDragEnd(sprite, event) {
    if (!this.customPreviewMode) {
      sprite.isDragging = false
      sprite.dragData = null
    }
  }

  onDragMove(sprite) {
    if (!this.customPreviewMode && sprite.isDragging) {
      const newPos = sprite.dragData.getLocalPosition(this.stage)
      sprite.x = newPos.x - sprite.xOffCenter
      sprite.y = newPos.y - sprite.yOffCenter
    }
  }

  placeSpriteOnTop(sprite) {
    this.stage.setChildIndex(sprite, this.stage.children.length - 1)
  }

  customNewActiveSprite(mySprite, event) {
    if (!this.customPreviewMode) {
      this.placeSpriteOnTop(mySprite)
      mySprite.dragData = event.data
      mySprite.isDragging = true
      const localPos = mySprite.dragData.getLocalPosition(mySprite)

      // Could not figure this out :(
      // maybe later
      // const degree = mySprite.rotation * (180 / Math.PI)
      // const localPos = mySprite.dragData.getLocalPosition(mySprite)
      // const xOffRotate = localPos.x * Math.cos(degree) + localPos.y * Math.sin(degree)
      // const yOffRotate = -(localPos.x * Math.sign(degree)) + localPos.y * Math.cos(degree)

      if (mySprite.rotation <= 0.1 && mySprite.rotation >= -0.1) {
        mySprite.xOffCenter = mySprite.scale.x * localPos.x
        mySprite.yOffCenter = mySprite.scale.y * localPos.y
      } else {
        // if rotation is not close to 0, then dont bother calculating
        mySprite.xOffCenter = 0
        mySprite.yOffCenter = 0
      }

      if (!this.activeSprite) {
        this.activeSprite = mySprite
        this.customSetControlVisibility(true)
        return null
      }
      if (mySprite.customId !== this.activeSprite.customId) {
        this.activeSprite = mySprite
        this.customSetControlVisibility(true)
      }
    }
    return null
  }

  customSetControlVisibility(bool) {
    if (this.customControls.toggle) {
      Object.keys(this.customControls).forEach((key) => {
        if (key !== 'visible' && key !== 'toggle') {
          this.customControls[key].visible = bool
        }
      })
    }

    if (this.customButtons.rotate) {
      this.customButtons.rotate.visible = bool
    }
    if (this.customButtons.resize) {
      this.customButtons.resize.visible = bool
    }
    if (this.customButtons.toggleControls) {
      this.customButtons.toggleControls.visible = bool
    }
    if (this.customButtons.copy) {
      this.customButtons.copy.visible = bool
    }
    if (this.customButtons.delete) {
      this.customButtons.delete.visible = bool
    }
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
    const doubleOffset = offSet * 2
    const activeSpriteXWidth = (activeSprite.anchor.x * activeSprite.width)
    const activeSpriteYHeight = (activeSprite.anchor.y * activeSprite.height)

    controls.left.x = activeSprite.x - offSet - activeSpriteXWidth
    controls.left.y = activeSprite.y - offSet - activeSpriteYHeight
    controls.left.height = activeSprite.height + doubleOffset

    controls.top.x = activeSprite.x - offSet - activeSpriteXWidth
    controls.top.y = activeSprite.y - offSet - activeSpriteYHeight
    controls.top.width = activeSprite.width + doubleOffset

    // -4 at the end because thats the width of the line
    controls.right.x = activeSprite.x + activeSprite.width + offSet - 4 - activeSpriteXWidth
    controls.right.y = activeSprite.y - offSet - activeSpriteYHeight
    controls.right.height = activeSprite.height + doubleOffset

    controls.bottom.x = activeSprite.x - offSet - activeSpriteXWidth
    controls.bottom.y = activeSprite.y + activeSprite.height + offSet - 4 - activeSpriteYHeight
    controls.bottom.width = activeSprite.width + doubleOffset

    const circleOffsetW = controls.resizeH.width / 2
    const circleOffsetH = controls.resizeH.height / 2

    controls.resizeH.x = controls.left.x - circleOffsetW
    controls.resizeH.y = controls.left.y + controls.left.height / 2 - circleOffsetH

    controls.resizeH2.x = controls.right.x - circleOffsetW
    controls.resizeH2.y = controls.right.y + controls.right.height / 2 - circleOffsetH

    controls.resizeV.x = controls.top.x + controls.top.width / 2 - circleOffsetW
    controls.resizeV.y = controls.top.y - circleOffsetH

    controls.resizeV2.x = controls.bottom.x + controls.bottom.width / 2 - circleOffsetW
    controls.resizeV2.y = controls.bottom.y - circleOffsetH

    controls.resizeD.x = controls.left.x - circleOffsetW
    controls.resizeD.y = controls.left.y - circleOffsetH

    controls.resizeD2.x = controls.right.x - circleOffsetW
    controls.resizeD2.y = controls.right.y - circleOffsetH

    controls.resizeD3.x = controls.right.x - circleOffsetW
    controls.resizeD3.y = controls.right.y + controls.right.height - circleOffsetH

    controls.resizeD4.x = controls.left.x - circleOffsetW
    controls.resizeD4.y = controls.left.y + controls.left.height - circleOffsetH

    this.controlLayer.pivot.x = activeSprite.position.x
    this.controlLayer.pivot.y = activeSprite.position.y
    this.controlLayer.position.x = activeSprite.position.x
    this.controlLayer.position.y = activeSprite.position.y
    this.controlLayer.rotation = activeSprite.rotation
  }

  customCreateControls() {
    const line = new PIXI.Graphics()
    const lineWidth = 4
    const lineColor = 0x000000
    line.lineStyle(lineWidth, lineColor, 1)
    line.moveTo(0, 0)
    line.lineTo(0, 100)
    const texture1 = this.renderer.generateTexture(line)
    const line2 = new PIXI.Graphics()
    line2.lineStyle(lineWidth, lineColor, 1)
    line2.moveTo(0, 0)
    line2.lineTo(100, 0)
    const texture2 = this.renderer.generateTexture(line2)

    const circle = new PIXI.Graphics()
    circle.beginFill(lineColor)
    circle.drawEllipse(0, 0, 12, 12)
    circle.endFill()
    const circleTexture = this.renderer.generateTexture(circle)

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
        let scaleVal = 0

        if (item.customId.substr(0, 7) === 'resizeD') {
          // diagonals are special case
          const diffX = newPos.x - item.lastPos.x
          const diffY = newPos.y - item.lastPos.y

          if (item.customId === 'resizeD') {
            scaleVal = ((diffX < 0 && diffY < 0) && 0.01) || ((diffX > 0 && diffY > 0) && -0.01)
          } else if (item.customId === 'resizeD2') {
            scaleVal = ((diffX > 0 && diffY < 0) && 0.01) || ((diffX < 0 && diffY > 0) && -0.01)
          } else if (item.customId === 'resizeD3') {
            scaleVal = ((diffX > 0 && diffY > 0) && 0.01) || ((diffX < 0 && diffY < 0) && -0.01)
          } else if (item.customId === 'resizeD4') {
            scaleVal = ((diffX < 0 && diffY > 0) && 0.01) || ((diffX > 0 && diffY < 0) && -0.01)
          }
          this.activeSprite.scale.x *= 1 + scaleVal
          this.activeSprite.scale.y *= 1 + scaleVal
          item.lastPos = newPos
          return null
        }

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

    // resize diagonal
    const resizeD = new PIXI.Sprite(circleTexture)
    const resizeD2 = new PIXI.Sprite(circleTexture)
    const resizeD3 = new PIXI.Sprite(circleTexture)
    const resizeD4 = new PIXI.Sprite(circleTexture)

    // resize horizontal
    const resizeH = new PIXI.Sprite(circleTexture)
    const resizeH2 = new PIXI.Sprite(circleTexture)

    // resize vertical
    const resizeV = new PIXI.Sprite(circleTexture)
    const resizeV2 = new PIXI.Sprite(circleTexture)

    const bottomSprite = new PIXI.Sprite(texture2)
    const topSprite = new PIXI.Sprite(texture2)
    const leftSprite = new PIXI.Sprite(texture1)
    const rightSprite = new PIXI.Sprite(texture1)

    resizeH.customId = 'resizeH'
    resizeH2.customId = 'resizeH2'
    resizeV.customId = 'resizeV'
    resizeV2.customId = 'resizeV2'
    resizeD.customId = 'resizeD'
    resizeD2.customId = 'resizeD2'
    resizeD3.customId = 'resizeD3'
    resizeD4.customId = 'resizeD4'

    makeInteractive(resizeD)
    makeInteractive(resizeD2)
    makeInteractive(resizeD3)
    makeInteractive(resizeD4)
    makeInteractive(resizeH)
    makeInteractive(resizeH2)
    makeInteractive(resizeV)
    makeInteractive(resizeV2)

    return {
      resizeD,
      resizeD2,
      resizeD3,
      resizeD4,
      resizeV,
      resizeV2,
      resizeH,
      resizeH2,
      visible: false,
      toggle: true,
      left: leftSprite,
      top: topSprite,
      right: rightSprite,
      bottom: bottomSprite,
    }
  }

  customPreDraw(timeDelta) {
    if (!this.customPreviewMode) {
      if (this.customGifSprites.length) {
        this.customGifSprites.forEach(sprite => sprite.gotoAndStop(this.customGifFrameCounter))
        this.customGifFrameCounter += 1
        if (this.customGifFrameCounter >= this.maxGifFrames) this.customGifFrameCounter = 0
      }
      if (this.activeSprite) {
        this.customAlignControls()
      }
    }
  }

  setupCustomBuilder() {
    this.socket.off('po')
    this.customBuildMode = true
    this.removeButtons()
    // this.addButton(this.endGameButton)
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
    const textStyle = { fontSize: 40 }
    const myButtons = []
    const buttonTexts = ['Cancel', 'Preview', 'Submit', 'Add Image', 'Add Text', 'Toggle Controls', 'Copy', 'Rotate', 'Resize', 'Delete']
    buttonTexts.forEach((txt) => {
      const btn = this.addCanvasButton(txt, {
        x: xOffset,
        y: yOffset,
        textStyle,
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
      } else if (txt === 'Rotate') {
        btn.visible = false
        // initially, theres nothing to rotate
        btn.on('pointerdown', this.customRotate)
        this.customButtons.rotate = btn
      } else if (txt === 'Resize') {
        btn.visible = false
        btn.on('pointerdown', this.customResize)
        this.customButtons.resize = btn
      } else if (txt === 'Toggle Controls') {
        btn.visible = false
        btn.on('pointerdown', this.customToggleControls)
        this.customButtons.toggleControls = btn
      } else if (txt === 'Copy') {
        btn.visible = false
        btn.on('pointerdown', this.customCopy)
        this.customButtons.copy = btn
      } else if (txt === 'Delete') {
        btn.visible = false
        btn.on('pointerdown', this.customDelete)
        this.customButtons.delete = btn
      } else if (txt === 'Preview') {
        btn.on('pointerdown', this.customPrePreview)
      } else if (txt === 'Submit') {
        btn.on('pointerdown', () => {
          this.customPrePreview(null, 'Submit Setup', 'submit')
        })
      }
      myButtons.push(btn)
    })

    setTimeout(() => {
      this.setBackgroundColor('white')
    }, 100)
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

  placeTexture(name, position) {
    let textures = []
    let play
    if (name === this.placeholder.name) {
      const { texture } = PIXI.loader.resources[name]
      textures = [texture]
      play = false // because placeholder texture is a single frame
    } else {
      textures = this.textures[name]
      play = (textures.length > 1) // only play if its more than a single frame
    }
    const { x, y } = calculateCenterPosition(textures[0], position)
    const sprite = this.addGif(textures, { x, y, play, container: this.stage })
    return sprite
  }

  hasTexture(name) {
    return has.call(this.textures, name)
  }

  onPopIt(obj) {
    const positionString = obj.substr(0, 2)
    const textureName = obj.substr(2, obj.length)
    const pos = getRealPosition(positionString)

    if (this.hasTexture(textureName)) {
      this.placeTexture(textureName, pos)
    } else {
      const sprite = this.placeTexture(this.placeholder.name, pos)
      this.dataMan.getDataLater(textureName, async (err, data) => {
        let newTexture
        if (!this.hasTexture(textureName)) {
          newTexture = await this.buildTextureAndPreview(textureName, data)
        } else {
          newTexture = this.textures[textureName]
        }
        sprite._textures = newTexture
        if (newTexture.length > 1) {
          sprite.gotoAndPlay(0)
        } else {
          sprite._texture = newTexture[0]
          sprite.gotoAndStop(0)
        }
      })
    }
  }

  searchForDataNumber(num, callback) {
    const handleFilter = (n, cb) => {
      const searchNum = n
      const newLoopArray = []
      // only search if user entered something other
      // than empty space
      this.previewImages.forEach((obj) => {
        const len = searchNum.length
        const { name } = obj
        if (name.substr(0, len) === searchNum) {
          newLoopArray.push(obj)
        }
        if (name.substr(0, len + 1) === `.${searchNum}`) {
          // also try to search a potentially modified search value
          // this happens when two uploads happen simultaneously. lets say both
          // have a data number of 1c. when one gets uploaded it stays 1c, when the
          // next one gets uploaded it gets a . prepended, and some random numbers at the end
          // so it might become .1cwzzy
          newLoopArray.push(obj)
        }
      })
      cb([...this.sortBaseX(newLoopArray, 'name', 32)])
    }

    if (this.hasTexture(num)) {
      handleFilter(num, callback)
    } else {
      this.dataMan.getDataLater(num, (err, data) => {
        if (err) {
          handleFilter(num, callback)
          return null
        }

        const hasTexture = this.hasTexture(num)
        if (!hasTexture) {
          this.buildTextureAndPreview(num, data)
            .then(() => {
              handleFilter(num, callback)
            })
            .catch(() => {
              handleFilter(num, callback)
            })
        } else {
          handleFilter(num, callback)
        }
      })
    }
  }

  buildTextureAndPreview(name, data) {
    const tempTextures = []
    return new Promise((res, rej) => {
      try {
        data.forEach(async (b64str, index) => {
          try {
            const imgStr = `data:image/png;base64,${b64str}`
            const texture = await createImage({
              file: imgStr,
              alreadyURL: true,
            })
            tempTextures.push(texture)
            if (index === 0) {
              this.previewImages.push({
                name,
                url: imgStr,
              })
            }
            if (index === data.length - 1) {
              this.textures[name] = tempTextures
              return res(this.textures[name])
            }
          } catch (e) {
            throw e
          }
        })
      } catch (e) {
        return rej(e)
      }
    })
  }

  emitPopIt(event) {
    const position = getLocalPosition(event, this.root)
    const name = this.poppingName
    const posString = positionToString(position)
    const msg = `${posString}${name}`
    this.socket.emit('pi', msg)
  }
}
