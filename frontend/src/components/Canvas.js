import React, { Component } from 'react'
import PropTypes from 'prop-types'

import RenderWindow from '../RenderWindow'

export default class Canvas extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.RW = null

    this.brain.store('Canvas', this)
    this.popIt = this.popIt.bind(this)
  }

  componentDidMount() {
    const size = this.leaflet.offsetHeight
    try {
      this.brain.tell.Buttons.adjust(size, false)
    } catch (e) {
      // do nothing
    }
    const { brain } = this
    this.RW = new RenderWindow({ brain, size: [1069, 1069] })
  }

  popIt(name) {
    const randomBetween = (min, max) => {
      return Math.floor(Math.floor(Math.random() * (max - min + 1) + min))
    }
    const width = this.RW.getWidth()
    const height = this.RW.getHeight()
    const pos = { x: randomBetween(0, width), y: randomBetween(0, height) }
    this.RW.drawImage(name, pos)
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
