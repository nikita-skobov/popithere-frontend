import React from 'react'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
} from 'reactstrap'

import { defaultButtons } from '../customConfig'

export default function About() {
  return (
    <Col fluid>
      <Row>
        <h1 className="ma mthalfem mbhalfem">PopItHere!</h1>
      </Row>
      <Row className="cool-bottom-line">
        <h6 className="ml1em mr1em pb1em">
          PopItHere is part game, part collaborative art piece.
           Users can create their own gifs/images (called PopIts),
           and place them down anywhere on a square canvas. When
           they place a PopIt, it covers up anything that was under
           it, which makes the canvas change very quickly.
        </h6>
      </Row>
    </Col>
  )
}
