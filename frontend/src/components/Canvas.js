import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { assetList } from '../customConfig'

import { createRenderer, replaceCanvas, loadAssets } from '../utils/PixiUtils'
import { getCurrentGame } from '../utils/GameUtils'

export default class Canvas extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.RW = null

    this.brain.store('Canvas', this)
    this.settingsChange = this.settingsChange.bind(this)
    this.newGame = this.newGame.bind(this)
    this.newButtons = this.newButtons.bind(this)
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
      transparent: true,
      preserveDrawingBuffer: true,
    })
    replaceCanvas(this.renderer.view)
    const modal = this.brain.ask.MyModal
    const socket = this.brain.ask.Sockets
    const dataMan = this.brain.ask.DataMan
    const limitMan = this.brain.ask.LimitManager
    const alertSystem = this.brain.ask.AlertSystem
    const tokenMan = this.brain.ask.Tokens
    const uploader = this.brain.ask.Uploads
    this.currentGame = getCurrentGame({
      renderer: this.renderer,
      tokenMan,
      alertSystem,
      limitMan,
      modal,
      socket,
      uploader,
      dataMan,
      canvas: this,
    })
    this.newGame()
  }

  endGame() {
    this.currentGame.endGame()
    this.brain.tell.Buttons.newButtons([])
    this.currentGame = null

    setTimeout(() => {
      const modal = this.brain.ask.MyModal
      const socket = this.brain.ask.Sockets
      const dataMan = this.brain.ask.DataMan
      const limitMan = this.brain.ask.LimitManager
      const alertSystem = this.brain.ask.AlertSystem
      const tokenMan = this.brain.ask.Tokens
      const uploader = this.brain.ask.Uploads
      this.currentGame = getCurrentGame({
        renderer: this.renderer,
        tokenMan,
        alertSystem,
        limitMan,
        modal,
        socket,
        uploader,
        dataMan,
        canvas: this,
      })
      this.newGame()
    }, 10000)
  }

  newGame() {
    this.newButtons(this.currentGame.getButtons())
  }

  newButtons(buttons) {
    this.brain.tell.Buttons.newButtons(buttons)
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
