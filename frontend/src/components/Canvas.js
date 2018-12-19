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
    const renderer = createRenderer({
      size: [1024, 1024],
      backgroundColor: 0x000000,
    })
    const root = createRoot(renderer, { interactive: true })
    replaceCanvas(renderer.view)
    const modal = this.brain.ask.MyModal
    const game = getCurrentGame({ renderer, root, modal })
    this.newGame(game)
  }

  endGame(game) {
    game.endGame()
    this.brain.tell.Buttons.newButtons([])
  }

  newGame(game) {
    this.brain.tell.Buttons.newButtons(game.getButtons())

    // setTimeout(() => {
    //   this.endGame(game)
    // }, 20000)
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
