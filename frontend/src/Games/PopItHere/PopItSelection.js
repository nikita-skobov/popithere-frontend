import React, { Component } from 'react'
import {
  Row,
  Col,
  Button,
  CustomInput,
  Form,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Label,
  Progress,
  Input,
} from 'reactstrap'

import 'rc-slider/assets/index.css'
import Slider from 'rc-slider'

import PropTypes from 'prop-types'

import RowGenerator from './RowGenerator'

import { createImage, createGifTextures } from '../../utils/PixiUtils'
import ContainsBadWords from '../../utils/ContainsBadWords'
import Detector from '../../utils/FontDetector'

const notSubmit = (e) => {
  e.preventDefault()
}

const scaleMap = (num, inMin, inMax, outMin, outMax) => {
  return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

const testFontList = [
  'Arial',
  'Times New Roman',
  'Georgia',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Verdana',
  'Courier New',
]

const fontList = []

const fontDetector = new Detector()
testFontList.forEach((font) => {
  if (fontDetector.detect(font)) {
    fontList.push(font)
  }
})

// const normalizeScale = (val) => {
//   // takes the current sprite scale factor
//   // and returns a normalized value between 0 and 100000
//   let pos = val
//   if (pos > 15) pos = 15
//   if (pos < 0) pos = 0
//   if (pos === 1) return 50000
//   if (pos > 1) {
//     return scaleMap(pos, 1, 15, 50000, 100000)
//   }
//   if (pos < 1) {
//     return scaleMap(pos, 0, 1, 0, 50000)
//   }
// }

// const denormalizeScale = (val) => {
//   // takes a value from a sliding scale
//   // and returns a value between 0 and 15
//   // to be applied to the sprite scale factor

//   let pos = val
//   if (pos > 100000) pos = 100000
//   if (pos < 0) pos = 0
//   if (pos === 50000) return 1
//   if (pos > 50000) {
//     return scaleMap(pos, 50000, 100000, 1, 15)
//   }
//   if (pos < 50000) {
//     return scaleMap(pos, 0, 50000, 0, 1)
//   }
// }

export default class PopItSelection extends Component {
  constructor(props) {
    super(props)
    this.game = props.game

    this.maxImages = 10

    this.state = {
      searchNum: '',
      loopArray: [...this.game.previewImages],
      ready: true,
      maxSize: 100,
      isSearching: false,
      isLoading: false,
      invalidInput: false,
      textInput: '',
      fill: 'hsl(275, 100%, 50%)', // popithere color is the default
      isDropdownOpen: false,
      fontFamily: fontList[0],
      fontSize: 100,
      loadingError: '',
      choice: props.startingChoice || 'none',
      offset: 0,
    }

    this.previousScaleBothVal = 500

    this.handleButton = this.handleButton.bind(this)
    this.handleCustom = this.handleCustom.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleRotate = this.handleRotate.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.handleText = this.handleText.bind(this)
    this.toggleTextDropdown = this.toggleTextDropdown.bind(this)
    this.handleTextColor = this.handleTextColor.bind(this)
    this.handleFontSelect = this.handleFontSelect.bind(this)
    this.handleResizeWidth = this.handleResizeWidth.bind(this)
    this.handleResizeHeight = this.handleResizeHeight.bind(this)
    this.handleResizeBoth = this.handleResizeBoth.bind(this)
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
      } else if (file.type !== 'image/bmp' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/svg+xml') {
        // all other formats are not allowed
        throw new Error(`Unsupported file format: ${file.type}`)
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
      const { invalidInput, maxSize, choice } = this.state
      if (!invalidInput) {
        this.setState({ choice: 'loading' })
        this.game.customPreview(maxSize, (closeit) => {
          if (closeit) {
            this.game.modal.toggle()
          }
        }, choice)
      }
    } else if (name === 'cancel') {
      this.game.modal.toggle()
    }
  }

  handleTextColor(e) {
    if (e < 0) {
      this.setState({ fill: 'black' })
    } else if (e > 359) {
      this.setState({ fill: 'white' })
    } else {
      this.setState({ fill: `hsl(${e}, 100%, 50%)` })
    }
  }

  handleFontSelect(e) {
    const { target } = e
    const { innerHTML } = target
    this.setState({ fontFamily: innerHTML })
  }

  toggleTextDropdown() {
    this.setState((prevState) => {
      const tempState = prevState
      tempState.isDropdownOpen = !tempState.isDropdownOpen
      return tempState
    })
  }

  handleText(e) {
    e.preventDefault()
    const { name, value } = e.target
    if (name === 'text') {
      this.setState({ textInput: value })
    } else if (name === 'submit') {
      const { textInput, fontSize, fill, fontFamily } = this.state

      if (!ContainsBadWords(textInput)) {
        this.game.customNewImage(textInput, 'text', { fontSize, fill, fontFamily })
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

  handleResizeHeight(e) {
    this.game.activeSprite.scale.y = Math.exp(e)
    // this.game.activeSprite.scale.y = denormalizeScale(e)
  }

  handleResizeWidth(e) {
    this.game.activeSprite.scale.x = Math.exp(e)
    // this.game.activeSprite.scale.x = denormalizeScale(e)
  }

  handleResizeBoth(e) {
    // this function sucks
    const { scale } = this.game.activeSprite
    if (scale.x > 0 && scale.y > 0) {
      let scaleVal = 0.072
      if (e < this.previousScaleBothVal) {
        scaleVal = -scaleVal
      }
      this.game.activeSprite.scale.x *= 1 + scaleVal
      this.game.activeSprite.scale.y *= 1 + scaleVal
      this.previousScaleBothVal = e
      if (this.game.activeSprite.scale.x < 0) {
        this.game.activeSprite.scale.x = 0.01
      }
      if (this.game.activeSprite.scale.y < 0) {
        this.game.activeSprite.scale.y = 0.01
      }
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

    let closeModal = () => {
      this.game.modal.toggle()
    }
    closeModal = closeModal.bind(this)

    if (choice === 'none') {
      return (
        <Row>
          <Col fluid>
            <Button className="btn-popithere" onClick={this.handleButton} name="image" block>Pre-Made</Button>
          </Col>
          <Col fluid>
            <Button className="btn-popithere" onClick={this.handleCustom} name="custom" block>Make your own!</Button>
          </Col>
        </Row>
      )
    }

    if (choice === 'loading') {
      return (
        <Col fluid>
          <Row>
            <Progress className="w100 mb1em" animated value={100} color={loadingError ? 'danger' : 'success'}>{loadingError ? `Error: ${loadingError}` : 'Loading'}</Progress>
          </Row>
          {loadingError && (
            <Row>
              <Button onClick={closeModal} className="btn-popithere">Close</Button>
            </Row>
          )}
        </Col>
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
                <Slider onChange={this.handleRotate} min={-180} max={180} step={5} defaultValue={dfv} marks={{ '-180': -180, '-90': -90, 0: 0, 90: 90, 180: 180 }} />
              </FormGroup>
            </Form>
          </Col>
        </Row>
      )
    }

    if (choice === 'resize') {
      const { x, y } = this.game.activeSprite.scale
      // const normX = normalizeScale(x)
      // const normY = normalizeScale(y)
      const normY = Math.log(y)
      const normX = Math.log(x)
      return (
        <Col fluid>
          <Row>
            <Label for="doesThisEvenMatter">Both</Label>
            <Slider onChange={this.handleResizeBoth} min={0} max={1000} defaultValue={this.previousScaleBothVal} />
          </Row>
          <Row>
            <Label for="rotateControl">Width</Label>
            <Slider onChange={this.handleResizeWidth} min={-5} max={4} step={0.005} defaultValue={normX} />
          </Row>
          <Row>
            <Label for="rotateControl">Height</Label>
            <Slider onChange={this.handleResizeHeight} min={-5} max={4} step={0.005} defaultValue={normY} />
          </Row>
        </Col>
      )
    }

    if (choice === 'preview' || choice === 'submit') {
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
              <Button className="mr1em btn-popithere" onClick={this.handlePreview} name="submit">Submit</Button>
              <Button className="btn-popithere" onClick={this.handlePreview} name="cancel">Cancel</Button>
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
                <CustomInput onChange={this.handleFile} type="file" accept=".jpeg,.jpg,.gif,.png,.bmp,.svg" label="Choose an image" id="filebrowser" name="customFileBrowser" />
                <Button className="mt1em btn-popithere" onClick={this.game.modal.toggle} name="cancel">Cancel</Button>
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
            <Button className="btn-popithere" onClick={this.handleCancel} name="yes" block>Yes</Button>
          </Col>
          <Col fluid>
            <Button className="btn-popithere" onClick={this.handleCancel} name="no" block>No</Button>
          </Col>
        </Row>
      )
    }

    if (choice === 'text') {
      const { fontSize, invalidInput, fill, isDropdownOpen, fontFamily } = this.state
      return (
        <Col fluid>
          <Form onSubmit={notSubmit}>
            <Row>
              <FormGroup className="w100">
                <Label for="textinput">Enter your text: </Label>
                <Input invalid={invalidInput} onChange={this.handleText} type="text" placeholder="Your Text Here..." id="textinput" name="text" />
              </FormGroup>
            </Row>
            <Row>
              <FormGroup className="w100">
                <Label for="textinputsize">Size: </Label>
                <Input onChange={this.handleText} defaultValue={fontSize} type="number" id="textinputsize" name="size" />
              </FormGroup>
            </Row>
            <Row>
              <Label>Font: </Label>
            </Row>
            <Row className="pb1em">
              <Dropdown isOpen={isDropdownOpen} toggle={this.toggleTextDropdown}>
                <DropdownToggle style={{ fontFamily }} className="btn-popithere" caret>
                  {fontFamily}
                </DropdownToggle>
                <DropdownMenu>
                  {fontList.map(fontName => <DropdownItem style={{ fontFamily: fontName }} onClick={this.handleFontSelect}>{fontName}</DropdownItem>)}
                </DropdownMenu>
              </Dropdown>
            </Row>
            <Row>
              <Label>Color: </Label>
            </Row>
            <Row className="pb1em">
              <Slider onChange={this.handleTextColor} min={-1} max={360} step={0.01} defaultValue={275} />
            </Row>
            <Row className="pb1em">
              <div className="w100" style={{ border: '1px solid black', height: '40px', backgroundColor: fill }} />
            </Row>
            <Row>
              <Button className="btn-popithere" onClick={this.handleText} name="submit">Submit</Button>
            </Row>
          </Form>
        </Col>
      )
    }

    if (choice === 'image') {
      const { offset, ready, isSearching, loopArray, isLoading } = this.state

      const refresh = () => {
        this.setState({ offset: 0, ready: false, isSearching: false, isLoading: true })
        this.game.reloadTextures(this)
      }

      const mylist = () => {
        this.setState({ offset: 0, ready: false, isSearching: false, isLoading: true })
        this.game.reloadTextures(this, true)
      }

      const search = () => {
        this.setState((prevState) => {
          const tempState = prevState
          tempState.isSearching = !tempState.isSearching
          if (!tempState.isSearching) {
            // if we set it back to false
            tempState.loopArray = this.game.previewImages
          }
          return tempState
        })
      }

      const handlePreSearch = (e) => {
        const { name, value } = e.target
        if (name === 'searchnum') {
          this.setState({ searchNum: value.toLowerCase() })
        } else if (name === 'go') {
          this.setState((prevState) => {
            const tempState = prevState
            const { searchNum } = tempState

            const emptyStrRegEx = /^\s*$/
            if (!searchNum || emptyStrRegEx.test(searchNum)) {
              // if it is empty string, or only contains spaces
              return tempState
            }

            if (tempState.ready) {
              tempState.ready = false
              tempState.isLoading = true

              this.game.searchForDataNumber(searchNum, (newList) => {
                this.setState({ offset: 0, ready: true, loopArray: newList, isLoading: false })
              })

              return tempState
            }
            // dont search if already searching
            return tempState
          })
        }
      }

      return (
        <div>
          <Button disabled={isLoading} className="mb1em mr1em btn-popithere" onClick={this.handleButton} name="back">Back</Button>
          <Button disabled={isLoading} className="mb1em mr1em btn-popithere" onClick={refresh} name="refresh">Refresh</Button>
          <Button disabled={isLoading} className="mb1em mr1em btn-popithere" onClick={mylist} name="mylist">My PopIts</Button>
          <Button disabled={isLoading} className="mb1em mr1em btn-popithere" onClick={search} name="search">Search</Button>
          {isSearching && (
            <InputGroup className="mb1em">
              <Input onChange={handlePreSearch} type="text" placeholder="Enter a data number" id="searchnum" name="searchnum" />
              <InputGroupAddon addonType="append">
                <Button className="btn-popithere" disabled={isLoading} onClick={handlePreSearch} name="go">Go</Button>
              </InputGroupAddon>
            </InputGroup>
          )}
          <Button className="mb1em btn-popithere" onClick={this.handleButton} name="prev" block disabled={offset === 0 || isLoading}> Previous </Button>
          {ready && (
            <RowGenerator
              isSearching={isSearching}
              key={Date.now()}
              cb={this.popItChosen}
              cellCount={this.maxImages}
              offset={offset}
              loopArray={loopArray}
            />
          )}
          <Button className="btn-popithere" onClick={this.handleButton} name="next" block disabled={loopArray.length - this.maxImages <= offset || isLoading}> Next </Button>
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
