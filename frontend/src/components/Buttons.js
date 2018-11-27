import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Buttons extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('Buttons', this)
  }

  render() {
    return (
      <div className="pos">
        <div className="square">
          <canvas className="canvas" />
        </div>
      </div>
    )
  }
}

Buttons.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
