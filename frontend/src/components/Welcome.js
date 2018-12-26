import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Welcome extends Component {
  constructor(props) {
    super()
    this.brain = props.brain

    this.state = {
      messages: [props.initialMessage],
    }
  }

  render() {
    console.log('rendering welcome')
    return <div />
  }
}

Welcome.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  initialMessage: PropTypes.string.isRequired,
}
