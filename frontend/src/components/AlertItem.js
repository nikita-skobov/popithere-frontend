import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Alert,
} from 'reactstrap'

const has = Object.prototype.hasOwnProperty

export default class AlertSystem extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.data = props.data

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
  }

  render() {
    const { data } = this
    return (
      <Alert color={data.color}>
        {data.text}
      </Alert>
    )
  }
}

AlertSystem.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
}
