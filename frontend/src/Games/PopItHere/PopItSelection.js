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
  Progress,
  Input,
} from 'reactstrap'

import 'rc-slider/assets/index.css'
import Slider, { Range } from 'rc-slider'

import PropTypes from 'prop-types'

import * as PIXI from 'pixi.js'

import RowGenerator from './RowGenerator'

import { assetList } from '../../customConfig'

import { createImage, createGifTextures } from '../../utils/PixiUtils'
import ContainsBadWords from '../../utils/ContainsBadWords'

const notSubmit = (e) => {
  e.preventDefault()
}

export default class PopItSelection extends Component {
  constructor(props) {
    super(props)
    this.game = props.game

    this.maxImages = 10

    this.state = {
      maxSize: 100,
      invalidInput: false,
      textInput: '',
      fontSize: 26,
      loadingError: '',
      choice: props.startingChoice || 'none',
      offset: 0,
    }

    this.handleButton = this.handleButton.bind(this)
    this.handleCustom = this.handleCustom.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleRotate = this.handleRotate.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.handleText = this.handleText.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.popItChosen = this.popItChosen.bind(this)
    this.handleFile = this.handleFile.bind(this)
    this.textureLoaded = this.textureLoaded.bind(this)
  }

  textureLoaded(txt) {
    this.game.customNewImage(txt)
    this.game.modal.toggle()
  }

  async handleFile(e) {
    e.preventDefault()
    const { target } = e
    const { files } = target
    const [file] = files

    this.setState({ choice: 'loading' })

    try {
      if (file.type === 'image/gif') {
        const gif = await createImage({ file, makeTexture: false })
        const textures = await createGifTextures(gif)
        this.textureLoaded(textures)
      } else {
        const texture = await createImage({ file })
        this.textureLoaded(texture)
      }
    } catch (err) {
      this.setState({ loadingError: err.message })
    }
  }

  handleCancel(e) {
    e.preventDefault()
    const { name } = e.target
    if (name === 'no') {
      this.game.modal.toggle()
    } else if (name === 'yes') {
      this.game.modal.toggle()
      this.game.customEnd()
    }
  }

  handlePreview(e) {
    e.preventDefault()
    const { name, value } = e.target
    if (name === 'maxSize') {
      const val = parseFloat(value)
      if (val >= 0 && val <= 100) {
        this.setState({ maxSize: val, invalidInput: false })
      } else {
        this.setState({ invalidInput: true })
      }
    } else if (name === 'submit') {
      const { invalidInput, maxSize } = this.state
      if (!invalidInput) {
        this.setState({ choice: 'loading' })
        this.game.customPreview(maxSize, (closeit) => {
          if (closeit) {
            this.game.modal.toggle()
          }
        })
      }
    }
  }

  handleText(e) {
    e.preventDefault()
    const { name, value } = e.target
    if (name === 'text') {
      this.setState({ textInput: value })
    } else if (name === 'submit') {
      const { textInput, fontSize } = this.state

      if (!ContainsBadWords(textInput)) {
        this.game.customNewImage(textInput, 'text', { fontSize })
        this.game.modal.toggle()
      } else {
        this.setState({ invalidInput: true })
      }

    } else if (name === 'size') {
      this.setState({ fontSize: parseInt(value, 10) })
    }
  }

  handleCustom(e) {
    e.preventDefault()
    this.game.modal.toggle()
    this.game.stopPoppingLive()
    this.game.clearCanvas()
    this.game.setupCustomBuilder()
  }

  handleRotate(e) {
    const degree = e
    const radians = degree * (Math.PI / 180)
    this.game.activeSprite.rotation = radians
  }

  handleResize(e) {
    e.preventDefault()
    const { name, value } = e.target
    if (name === 'width') {
      this.game.activeSprite.scale.x = parseFloat(value)
    } else if (name === 'height') {
      this.game.activeSprite.scale.y = parseFloat(value)
    }
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
    this.game.popItChosenLive(name)
    this.game.modal.toggle()
  }

  render() {
    const { choice, loadingError } = this.state

    if (choice === 'none') {
      return (
        <Row>
          <Col fluid>
            <Button onClick={this.handleButton} name="image" block>Pre-Made</Button>
          </Col>
          <Col fluid>
            <Button onClick={this.handleCustom} name="custom" block>Make your own!</Button>
          </Col>
        </Row>
      )
    }

    if (choice === 'loading') {
      return (
        <Row>
          <Col fluid>
            <Progress animated value={100} color={loadingError ? 'danger' : 'success'}>{loadingError ? `Error: ${loadingError}` : 'Loading'}</Progress>
          </Col>
        </Row>
      )
    }

    if (choice === 'rotate') {
      const { rotation } = this.game.activeSprite
      const dfv = rotation * (180 / Math.PI)
      return (
        <Row>
          <Col fluid>
            <Form onSubmit={notSubmit}>
              <FormGroup className="w100">
                <Slider onChange={this.handleRotate} min={-180} max={180} defaultValue={dfv} />
              </FormGroup>
            </Form>
          </Col>
        </Row>
      )
    }

    if (choice === 'resize') {
      const { x, y } = this.game.activeSprite.scale
      return (
        <Row>
          <Col fluid>
            <Form onSubmit={notSubmit}>
              <FormGroup className="w100">
                <Label for="rotateControl">Enter a scalar for width</Label>
                <Input onChange={this.handleResize} type="number" defaultValue={x} id="resizeControl" name="width" />
              </FormGroup>
            </Form>
          </Col>
          <Col fluid>
            <Form onSubmit={notSubmit}>
              <FormGroup className="w100">
                <Label for="rotateControl">Enter a scalar for height</Label>
                <Input onChange={this.handleResize} type="number" defaultValue={y} id="resizeControl" name="height" />
              </FormGroup>
            </Form>
          </Col>
        </Row>
      )
    }

    if (choice === 'preview') {
      const { invalidInput, maxSize } = this.state
      return (
        <Col fluid>
          <Form onSubmit={notSubmit}>
            <Row>
              <FormGroup className="w100">
                <Label for="maxSize">Enter your desired size (from 0 to 100)</Label>
                <Input invalid={invalidInput} onChange={this.handlePreview} type="number" defaultValue={maxSize} id="maxSize" name="maxSize" />
              </FormGroup>
            </Row>
            <Row>
              <Button onClick={this.handlePreview} name="submit">Submit</Button>
            </Row>
          </Form>
        </Col>
      )
    }

    if (choice === 'custom') {
      return (
        <Row>
          <Col fluid>
            <Form onSubmit={notSubmit}>
              <FormGroup>
                <Label for="filebrowser">Choose an image</Label>
                <CustomInput onChange={this.handleFile} type="file" label="Choose an image" id="filebrowser" name="customFileBrowser" />
                <Button onClick={this.game.modal.toggle} name="cancel" block>Cancel</Button>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      )
    }

    if (choice === 'cancel') {
      return (
        <Row>
          <Col fluid>
            <Button onClick={this.handleCancel} name="yes" block>Yes</Button>
          </Col>
          <Col fluid>
            <Button onClick={this.handleCancel} name="no" block>No</Button>
          </Col>
        </Row>
      )
    }

    if (choice === 'text') {
      const { fontSize, invalidInput } = this.state
      return (
        <Col fluid>
          <Form onSubmit={notSubmit}>
            <Row>
              <FormGroup>
                <Label for="textinput">Enter your text: </Label>
                <Input invalid={invalidInput} onChange={this.handleText} type="text" placeholder="Your Text Here..." id="textinput" name="text" />
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Label for="textinputsize">Size: </Label>
                <Input onChange={this.handleText} defaultValue={fontSize} type="number" id="textinputsize" name="size" />
              </FormGroup>
            </Row>
            <Row>
              <Button onClick={this.handleText} name="submit">Submit</Button>
            </Row>
          </Form>
        </Col>
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

PopItSelection.defaultProps = {
  startingChoice: '',
}

PopItSelection.propTypes = {
  game: PropTypes.instanceOf(Object).isRequired,
  startingChoice: PropTypes.string,
}
