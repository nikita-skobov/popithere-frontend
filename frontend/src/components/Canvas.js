import React, { Component } from 'react'
import PropTypes from 'prop-types'

import RenderWindow from '../RenderWindow'
import { assetList } from '../customConfig'

export default class Canvas extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.RW = null
    this.maxSprites = 10

    this.brain.store('Canvas', this)
    this.popIt = this.popIt.bind(this)
    this.popItChosen = this.popItChosen.bind(this)
    this.settingsChange = this.settingsChange.bind(this)
    this.newGame = this.newGame.bind(this)
  }

  componentDidMount() {
    const size = this.leaflet.offsetHeight
    try {
      this.brain.tell.Buttons.adjust(size, false)
    } catch (e) {
      // do nothing
    }
    const { brain, maxSprites } = this
    this.RW = new RenderWindow({
      brain,
      maxSprites,
      size: [1069, 1069],
      backgroundColor: 0xafa0fb,
    })
    this.RW.loadAssets(assetList)
  }

  settingsChange(type, value) {
    if (type === 'maxspritecount') {
      this.maxSprites = value
      this.RW.changeMaxSprites(value)
    }
  }

  newGame(game) {
    this.brain.tell.Buttons.newButtons(game.getButtons())
  }

  popItChosen(type, val) {
    if (type === 'image') {
      console.log(this.RW)
      console.log(this.RW.getHeight())
      this.RW.startPopping(val)
    }
  }

  popIt(name) {
    const howManyTimes = 3
    const loopArr = [...Array(howManyTimes).keys()]
    const randomBetween = (min, max) => {
      return Math.floor(Math.floor(Math.random() * (max - min + 1) + min))
    }

    loopArr.forEach(() => {
      const width = this.RW.getWidth()
      const height = this.RW.getHeight()
      const pos = { x: randomBetween(0, width), y: randomBetween(0, height) }
      this.RW.addImage(name, pos)
    })
    this.RW.render()
  }


  render() {
    return (
      <div className="pos">
        <div ref={(leaflet) => { this.leaflet = leaflet }} className="square">
          <canvas className="canvas" />
        </div>
      </div>
    )
  }
}

Canvas.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
