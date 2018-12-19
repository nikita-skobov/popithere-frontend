import React, { Component } from 'react'
import PropTypes from 'prop-types'

import RenderWindow from '../RenderWindow'
import { assetList } from '../customConfig'
import { createRenderer, createRoot, replaceCanvas } from '../utils/PixiUtils'
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
    // const { brain, maxSprites } = this
    // this.RW = new RenderWindow({
    //   brain,
    //   maxSprites,
    //   size: [1069, 1069],
    //   backgroundColor: 0x000000,
    // })
    // this.RW.loadAssets(assetList)

    const renderer = createRenderer({
      size: [1024, 1024],
      backgroundColor: 0x000000,
    })
    const root = createRoot(renderer)
    replaceCanvas(renderer.view)
    const modal = this.brain.ask.MyModal
    const game = getCurrentGame({ renderer, root, modal })
    this.newGame(game)
  }

  settingsChange(type, value) {
    // empty for now
  }

  newGame(game) {
    this.brain.tell.Buttons.newButtons(game.getButtons())
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
