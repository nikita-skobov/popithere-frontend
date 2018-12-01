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

    for(let i=0; i<3; i++) {
      const TEST_LAYER = this.addLayer(`test${i}`, {
        transparent: true,
      })
      this.addImage(`test1`, {
        x: 10 + i * 3, y: 10 + i * 3,
      }, TEST_LAYER)
      this.draw(TEST_LAYER)
    }

    // this.TEST_LAYER = this.addLayer('test', {
    //   backgroundColor: 0x48a23f,
    //   transparent: true,
    // })
    // this.addImage('test1',
    //   { x: 10, y: 10 },
    //   this.TEST_LAYER)
    // this.draw(this.TEST_LAYER)

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
    // this.baseLayer.animate('asda', () => {
    //   console.log('before draw')
    // }, () => {
    //   console.log('after draw')
    // })
    setTimeout(() => {
      console.log('ending GAME!')
      this.endGame()
    }, 10000)
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
    const { width, height } = PIXI.loader.resources[name].texture
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
