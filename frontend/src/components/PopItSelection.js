import React, { Component } from 'react'
import {
  Input,
  Label,
  Row,
  Col,
  Button,
} from 'reactstrap'

import PropTypes from 'prop-types'

import RowGenerator from './RowGenerator'

import { assetList } from '../customConfig'

export default class PopItSelection extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.maxImages = 16

    this.state = {
      choice: 'none',
      offset: 0,
    }

    this.brain.store('PopItSelection', this)

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
    const { choice } = this.state
    const { name } = e.target
    if (choice === 'none') {
      this.setState({ choice: name })
    }
    // if (type === 'options') {
    //   if (name === 'maxspritecount') {
    //     const num = parseInt(value, 10)
    //     if (!Number.isNaN(num)) {
    //       // if user input is actually a number
    //       this.brain.tell.Canvas.settingsChange(name, num)
    //     }
    //   }
    // }
  }

  render() {
    const { choice } = this.state

    if (choice === 'none') {
      return (
        <Row>
          <Col fluid>
            <Button onClick={this.handleButton} name="text" block>Text</Button>
          </Col>
          <Col fluid>
            <Button onClick={this.handleButton} name="image" block>Image</Button>
          </Col>
        </Row>
      )
    }

    if (choice === 'image') {
      const { offset } = this.state
      return (
        <div>
          <Button block disabled={offset === 0}> Previous </Button>
          <RowGenerator cellCount={this.maxImages} offset={offset} loopArray={assetList} />
          <Button block disabled={assetList.length - this.maxImages <= offset}> Next </Button>
        </div>
      )
    }
    return (
      <div />
    )
  }
}

PopItSelection.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
