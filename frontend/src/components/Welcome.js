import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button, Row, Col, ListGroup, ListGroupItem } from 'reactstrap'

export default class Welcome extends Component {
  constructor(props) {
    super()
    this.brain = props.brain

    this.state = {
      messages: [props.initialMessage],
      warnings: [],
      errors: [],
      ready: true,
      done: false,
    }

    this.brain.store('Welcome', this)
    this.addMessage = this.addMessage.bind(this)
  }

  addMessage(msg, notReady) {
    if (typeof msg === 'string') {
      // if its just a string, add to messages
      this.setState((prevState) => {
        const tempState = prevState
        tempState.messages.push(msg)
        if (notReady) tempState.ready = false
        return tempState
      })
    } else {
      // otherwise its an object
      const { warning, error, message } = msg
      this.setState((prevState) => {
        const tempState = prevState
        if (warning) tempState.warnings.push(warning)
        if (error) tempState.errors.push(error)
        if (message) tempState.messages.push(message)
        if (notReady) tempState.ready = false
        return tempState
      })
    }
  }

  welcomeDone() {
    const { ready } = this.state
    // if ready that means there were no errors/warnings,
    // so simply tell the App, that the welcome steps are done
    if (ready) {
      this.brain.tell.App.setState({ ready: true })
    } else {
      // if not ready, simply set done to true, and that
      // will render a confirmation button
      this.setState({ done: true })
    }
  }

  render() {
    console.log('rendering welcome')
    const { messages, done, warnings, errors } = this.state
    if (!done) {
      // not done, so keep rendering a list of messages
      return (
        <Col className="wlc">
          <Row className="mt3">
            <ListGroup className="w100 mtb3">
              {messages.map(msg => <ListGroupItem color="success">{msg}</ListGroupItem>)}
            </ListGroup>
          </Row>
          <Row />
          <Row />
          <Row />
        </Col>
      )
    }

    // if done is true, and ready is true, then this wouldnt even render
    // because this component unmounts when both flags are true.
    // this means that ready is FALSE, and thus we should show the user
    // all of the errors/warnings, as well as make them click a button before proceding
    return (
      <Col className="wlc">
        <Row className="mt3">
          <ListGroup className="w100 mtb3">
            {messages.map(msg => <ListGroupItem color="success">{msg}</ListGroupItem>)}
          </ListGroup>
        </Row>
        <Row>
          <ListGroup className="w100 mtb3">
            {warnings.map(wrn => <ListGroupItem color="warning">{wrn}</ListGroupItem>)}
          </ListGroup>
        </Row>
        <Row>
          <ListGroup className="w100 mtb3">
            {errors.map(err => <ListGroupItem color="danger">{err}</ListGroupItem>)}
          </ListGroup>
        </Row>
        <Row>
          {errors.length === 0 && (
            // no error, so render a confirm button to acknowledge warnings
            <Button color="green">I Understand</Button>
          )}
        </Row>
      </Col>
    )
  }
}

Welcome.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  initialMessage: PropTypes.string.isRequired,
}
