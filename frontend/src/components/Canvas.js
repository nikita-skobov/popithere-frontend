import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { assetList } from '../customConfig'

import { createRenderer, createRoot, replaceCanvas, loadAssets } from '../utils/PixiUtils'
import { getCurrentGame } from '../utils/GameUtils'

export default class Canvas extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.RW = null

    this.brain.store('Canvas', this)
    this.settingsChange = this.settingsChange.bind(this)
    this.newGame = this.newGame.bind(this)
    this.endGame = this.endGame.bind(this)

    this.currentGame = null
    this.renderer = null
  }

  componentDidMount() {
    const size = this.leaflet.offsetHeight
    try {
      this.brain.tell.Buttons.adjust(size, false)
    } catch (e) {
      // do nothing
    }

    loadAssets(assetList, this.afterLoad.bind(this))
  }

  settingsChange(type, value) {
    // empty for now
  }

  afterLoad() {
    this.renderer = createRenderer({
      size: [1024, 1024],
      backgroundColor: 0x000000,
    })
    replaceCanvas(this.renderer.view)
    const modal = this.brain.ask.MyModal
    this.currentGame = getCurrentGame({ renderer: this.renderer, modal, canvas: this })
    this.newGame()
  }

  endGame() {
    this.currentGame.endGame()
    this.brain.tell.Buttons.newButtons([])
    this.currentGame = null

    setTimeout(() => {
      const modal = this.brain.ask.MyModal
      this.currentGame = getCurrentGame({ renderer: this.renderer, modal, canvas: this })
      this.newGame()
    }, 10000)
  }

  newGame() {
    this.brain.tell.Buttons.newButtons(this.currentGame.getButtons())
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
