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

import { createImg, createGifTextures } from '../../utils/PixiUtils'

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
    this.textureLoaded = this.textureLoaded.bind(this)
  }

  // eslint-disable-next-line
  createImg(file, cb, alreadyURL) {
    const img = new Image()
    img.onload = () => {
      const base = new PIXI.BaseTexture(img)
      const texture = new PIXI.Texture(base)
      cb(texture, img)
    }
    img.src = alreadyURL ? file : URL.createObjectURL(file)
  }

  // eslint-disable-next-line
  createImageFromData(data) {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', data.width)
    canvas.setAttribute('height', data.height)
    const context = canvas.getContext('2d')
    context.putImageData(data, 0, 0)
    return canvas.toDataURL()
  }

  textureLoaded(txt) {
    this.game.popItChosen('image', txt)
    this.game.modal.toggle()
  }

  async handleFile(e) {
    e.preventDefault()
    const { target } = e
    const { files } = target
    const [file] = files
    console.log(file)
    if (file.type === 'image/gif') {
      console.log('its a gif')
      createImg({ file, makeTexture: false }, (gif) => {
        createGifTextures(gif, (textures) => {

        })
      })
      // createImg({ file, makeTexture: false }, (gif) => {
      //   console.log(gif)
      //   const sg = new window.SuperGif({ gif })
      //   console.log(sg)
      //   sg.load({
      //     success: () => {
      //       console.log('successfully loaded')
      //       const images = sg.getFrames().map(frame => this.createImageFromData(frame.data))
      //       console.log(images)
      //       console.log(images[0])
      //       createImg({ file: images[0], alreadyURL: true }, (txt2) => {
      //         this.game.popItChosen('image', txt2)
      //         this.game.modal.toggle()
      //       }, true)
      //       // images.forEach(data => this.createImg(data, (txt2) => {
      //       //   console.log(txt2)
      //       // }, true))
      //     },
      //     error: () => {
      //       console.log('load failed :(')
      //     },
      //   })
      // })
    } else {
      console.log('awaiting val!')
      const val = await createImg({ file })
      console.log('awaited done!')
      console.log(val)
      this.textureLoaded(val)
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
