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

    this.maxImages = 10

    this.state = {
      choice: 'none',
      offset: 0,
    }

    this.brain.store('PopItSelection', this)

    this.handleButton = this.handleButton.bind(this)
    this.popItChosen = this.popItChosen.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
    const { choice } = this.state
    const { name } = e.target
    if (choice === 'none') {
      this.setState({ choice: name })
    } else if (choice === 'image') {
      if (name === 'prev' || name === 'next') {
        this.setState((prevState) => {
          const tempState = prevState
          const delta = name === 'next' ? this.maxImages : -this.maxImages
          tempState.offset += delta
          return tempState
        })
      } else if (name === 'back') {
        this.setState({ choice: 'none' })
      }
    }
  }

  popItChosen(e) {
    e.preventDefault()
    const { name } = e.target
    console.log(name)
    this.brain.tell.Canvas.popItChosen('image', name)
    this.brain.tell.MyModal.toggle()
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
          <Button className="mb1em" onClick={this.handleButton} name="back">Back</Button>
          <Button className="mb1em" onClick={this.handleButton} name="prev" block disabled={offset === 0}> Previous </Button>
          <RowGenerator
            cb={this.popItChosen}
            cellCount={this.maxImages}
            offset={offset}
            loopArray={assetList}
          />
          <Button onClick={this.handleButton} name="next" block disabled={assetList.length - this.maxImages <= offset}> Next </Button>
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
