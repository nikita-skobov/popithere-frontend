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
      countdown: this.data.countdown && 1,
      timeLeft: 0,
    }

    if (this.data.countdown) {
      this.state.timeLeft = Math.floor(this.data.countdown / 1000)
      const decreaseTimeLeft = () => {
        this.setState((prevState) => {
          const tempState = prevState
          tempState.timeLeft -= 1
          if (tempState.timeLeft <= 0) {
            const { mutable } = this.state
            if (mutable) {
              this.endAlert()
            }
          } else {
            setTimeout(decreaseTimeLeft, 1000)
          }
          return tempState
        })
      }
      setTimeout(decreaseTimeLeft, 1000)
    }

    this.endAlert = this.endAlert.bind(this)
    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
  }

  endAlert(cb) {
    this.setState({ open: false, mutable: false })
    if (typeof cb === 'function') {
      cb()
    } else {
      this.brain.tell.AlertSystem.updateList()
    }
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
    const { open, waiting, countdown, timeLeft } = this.state

    return (
      <Alert isOpen={open} toggle={this.endAlert} color={data.color}>
        <div className="pr">
          {waiting > 0 && (
            <Button size="sm" className="mr1em" disabled color="secondary">{waiting}</Button>
          )}
          {data.text}
          {countdown && (
            <div className="pa r0 dil">
              {timeLeft}
            </div>
          )}
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
