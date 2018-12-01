import React from 'react'

import Game from '../Game'
import RenderLayer from '../../RenderLayer'
import PopItSelection from './PopItSelection'

export default class PopItHere extends Game {
  constructor(props) {
    super(props)

    this.inputLayer.on('pointerdown', (event) => {
      console.log('inside popithere pointerdown')
      this.pointerDown(event)
    })
    this.inputLayer.on('pointermove', (event) => {
      console.log('inside popithere pointer move')
    })

    this.addButton({
      name: 'popit2',
      text: 'Pop Itdsadsa!',
      on: () => {
        console.log('ya pressed tha button!!!')
      },
      modal: () => {
        return (
          <PopItSelection game={this} />
        )
      },
    })

    this.currentlyPopping = false
    this.poppingName = null


    this.secondLayer = new RenderLayer({
      size: this.size,
      transparent: true,
    })

    this.thirdLayer = new RenderLayer({
      size: this.size,
      transparent: true,
    })

    this.baseLayer.addImage('test1', { x: 10, y: 10 })
    this.baseLayer.draw()
    this.secondLayer.addImage('test1', { x: 50, y: 50 })
    this.secondLayer.draw()
    this.thirdLayer.addImage('test1', { x: 100, y: 100 })
    this.thirdLayer.draw()
  }

  popItChosen(type, val) {
    console.log('inside popItChosen')
    if (type === 'image') {
      this.startPopping(val)
    }
  }

  startPopping(name) {
    console.log('inside startPopping')
    this.poppingName = name
    this.currentlyPopping = true
  }

  pointerDown(event) {
    console.log('pointer down')
    if (this.currentlyPopping) {
      const clickPos = event.data.getLocalPosition(this.baseLayer.root)
      // const chat = {
      //   name: 'test',
      //   msg: `x:${clickPos.x}, y:${clickPos.y}`,
      // }
      // this.brain.tell.ChatBox.addChat(chat)
      // console.log(event.data.getLocalPosition(this.stage))
      const { x, y } = this.calculatePos(this.poppingName, clickPos)
      this.baseLayer.addImage(this.poppingName, { x, y })
      this.baseLayer.draw()
    }
  }
}
