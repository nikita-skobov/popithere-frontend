import React from 'react'

import Game from '../Game'
import RenderLayer from '../../RenderLayer'
import PopItSelection from './PopItSelection'

export default class PopItHere extends Game {
  constructor(props) {
    super(props)

    this.inputLayer.on('pointerdown', (event) => {
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


    // this.secondLayer = new RenderLayer({
    //   size: this.size,
    //   transparent: true,
    // })

    // this.thirdLayer = new RenderLayer({
    //   size: this.size,
    //   transparent: true,
    // })

    // this.baseLayer.addImage('test1', { x: 10, y: 10 })
    // this.baseLayer.draw()
    // this.secondLayer.addImage('test1', { x: 50, y: 50 })
    // this.secondLayer.draw()
    // this.thirdLayer.addImage('test1', { x: 100, y: 100 })
    // this.thirdLayer.draw()
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
      const clickPos = this.getLocalPosition(event)
      const { x, y } = this.calculatePos(this.poppingName, clickPos)
      this.baseLayer.addImage(this.poppingName, { x, y })
      this.baseLayer.draw()
    }
  }
}
