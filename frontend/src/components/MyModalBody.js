import React, { Component } from 'react'
import {
  Input,
  Label,
} from 'reactstrap'

import PropTypes from 'prop-types'

export default class MyModalBody extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.type = props.type

    this.brain.store('MyModalBody', this)
  }

  render() {
    const { type } = this
    const maxSpriteCount = this.brain.ask.Canvas.maxSprites

    if (type === 'options') {
      return (
        <div>
          <Label for="exampleCount" className="mr-sm-2">Max Sprite Count</Label>
          <Input bsSzie="sm" id="exampleCount" type="number" defaultValue={maxSpriteCount} />
        </div>
      )
    }
    return (
      <div />
    )
  }
}

MyModalBody.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  type: PropTypes.string.isRequired,
}
