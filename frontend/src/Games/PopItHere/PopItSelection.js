/* global Image */
import React, { Component } from 'react'
import {
  Row,
  Col,
  Button,
  CustomInput,
  Form,
  FormGroup,
  Label,
} from 'reactstrap'

import PropTypes from 'prop-types'

import * as PIXI from 'pixi.js'

import RowGenerator from './RowGenerator'

import { assetList } from '../../customConfig'

export default class PopItSelection extends Component {
  constructor(props) {
    super(props)
    this.game = props.game

    this.maxImages = 10

    this.state = {
      choice: 'none',
      offset: 0,
    }

    this.handleButton = this.handleButton.bind(this)
    this.popItChosen = this.popItChosen.bind(this)
    this.handleFile = this.handleFile.bind(this)
    this.createImg = this.createImg.bind(this)
  }

  // eslint-disable-next-line
  createImg(file, cb) {
    const img = new Image()
    img.onload = () => {
      const base = new PIXI.BaseTexture(img)
      const texture = new PIXI.Texture(base)
      cb(texture)
    }
    img.src = URL.createObjectURL(file)
  }

  textureLoaded(txt) {
    console.log(txt)
  }

  handleFile(e) {
    e.preventDefault()
    const { target } = e
    const { files } = target
    const [file] = files
    this.createImg(file, this.textureLoaded)
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
    this.game.popItChosen('image', name)
    this.game.modal.toggle()
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
          <Col fluid>
            <Button onClick={this.handleButton} name="custom" block>Make your own!</Button>
          </Col>
        </Row>
      )
    }

    if (choice === 'custom') {
      return (
        <Row>
          <Col fluid>
            <Form>
              <FormGroup>
                <Label for="filebrowser">Choose an image</Label>
                <CustomInput onChange={this.handleFile} type="file" label="Choose an image" id="filebrowser" name="customFileBrowser" />
              </FormGroup>
            </Form>
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
  game: PropTypes.instanceOf(Object).isRequired,
}
