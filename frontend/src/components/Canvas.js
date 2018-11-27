import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('Canvas', this)
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

App.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
