/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Container, Row, Col } from 'reactstrap'

export default class Square extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('Square', this)
  }

  render() {
    return (
      <div className="pos">
        <div className="square" />
      </div>
    )
  }
}

Square.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
