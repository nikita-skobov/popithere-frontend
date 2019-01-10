import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Alert,
  Button,
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
      waiting: props.waiting,
      mutable: true,
    }

    this.endAlert = this.endAlert.bind(this)
    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
  }

  endAlert(cb) {
    this.setState({ open: false, mutable: false })
    setTimeout(() => {
      cb()
    }, 300)
  }

  addWaiting() {
    const { mutable } = this.state
    if (mutable) {
      this.setState((prevState) => {
        const tempState = prevState
        tempState.waiting += 1
        return tempState
      })
    }
  }

  render() {
    const { data } = this
    const { open, waiting } = this.state

    return (
      <Alert isOpen={open} transition={{ appear: true, exit: true }} color={data.color}>
        <div>
          {waiting > 0 && (
            <Button size="sm" className="mr1em" disabled color="secondary">{waiting}</Button>
          )}
          {data.text}
        </div>
      </Alert>
    )
  }
}

AlertItem.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
  waiting: PropTypes.number.isRequired,
}
