import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Alert,
} from 'reactstrap'

const has = Object.prototype.hasOwnProperty

export default class AlertItem extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.data = props.data

    this.brain.store('AlertItem', this)

    this.state = {
      open: true,
    }

    this.endAlert = this.endAlert.bind(this)
    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
  }

  endAlert(cb) {
    this.setState({ open: false })
    setTimeout(() => {
      cb()
    }, 300)
  }

  render() {
    const { data } = this
    const { open } = this.state

    return (
      <Alert isOpen={open} transition={{ appear: true, exit: true }} color={data.color}>
        {data.text}
      </Alert>
    )
  }
}

AlertItem.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
}
