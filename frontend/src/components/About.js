import React from 'react'

import {
  Row,
  Col,
  Button,
} from 'reactstrap'

import PropTypes from 'prop-types'

import {
  patreonPage,
  githubPage,
  discordPage,
  websitePage,
  twitterPage,
} from '../customConfig'

export default function About(props) {
  const { brain } = props

  const userCount = brain.ask.App.getUserCount()

  return (
    <Col fluid>
      <Row>
        <h1 className="ma mthalfem">PopItHere!</h1>
      </Row>
      <Row>
        <p className="ma mbhalfem">Currently Online: {userCount}</p>
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
      <Row>
        <h3 className="ma mthalfem mbhalfem">Who made this?</h3>
      </Row>
      <Row>
        <h6 className="ml1em mr1em pb1em">
          This website was made by me, Nikita, under my company, Equilateral LLC. For any questions, or comments please email equilateralllc@gmail.com
        </h6>
      </Row>
      <Row className="cool-bottom-line pb1em">
        <Col />
        <Col xs="auto">
          <Row>
            <Col>
              <a target="_blank" rel="noopener noreferrer" className="tdnone" href={websitePage}>
                <Button className="ma db btn-my-website">Website</Button>
              </a>
            </Col>
            <Col>
              <a target="_blank" rel="noopener noreferrer" className="tdnone" href={twitterPage}>
                <Button className="ma db btn-twitter">Twitter</Button>
              </a>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
      <Row>
        <h3 className="ma mthalfem mbhalfem">
          Join our Discord!
        </h3>
      </Row>
      <Row>
        <h6 className="ml1em mr1em pb1em">
          This site has a Discord where you can have a better chatting experience with other users who enjoy the site.
           You can also submit bug reports, and discuss future features.
        </h6>
      </Row>
      <Row className="cool-bottom-line pb1em">
        <Col />
        <Col>
          <Row>
            <Col>
              <a target="_blank" rel="noopener noreferrer" className="tdnone" href={discordPage}>
                <Button className="db ma btn-discord">Discord</Button>
              </a>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
      <Row>
        <h3 className="ma mthalfem mbhalfem">
          Check out the Github!
        </h3>
      </Row>
      <Row>
        <h6 className="ml1em mr1em pb1em">
          This site is open source. Well, at least the frontend is. Feel free to look around, and submit issues that you find.
           This site was originally designed to be modular and to allow users to submit their own games and addons. This functionality
           is not there yet, but maybe you can help me work on it!
        </h6>
      </Row>
      <Row className="cool-bottom-line pb1em">
        <Col />
        <Col>
          <Row>
            <Col>
              <a target="_blank" rel="noopener noreferrer" className="tdnone" href={githubPage}>
                <Button className="db ma btn-github">Github</Button>
              </a>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
      <Row>
        <h3 className="ma mthalfem mbhalfem">
          Support me on Patreon
        </h3>
      </Row>
      <Row>
        <h6 className="ml1em mr1em pb1em">
          I started a Patreon page for people who like the websites I make, and want to support my hobby.
           All of my websites will have Patreon rewards for my patrons, and each site has different rewards.
           For example, on popithere.com, you will be allowed to upload, and place PopIts more frequently.
           On my last site, <a href="https://collabopath.com">Collabopath.com</a>, my Patrons were allowed to submit
           images, and items to be added to the game. If you decide to become a patron, please click on the {'"Benefits"'} button
           from the burger menu, and there you will be able to unlock your benefits via your Patreon account.
        </h6>
      </Row>
      <Row className="cool-bottom-line pb1em">
        <Col />
        <Col>
          <Row>
            <Col>
              <a target="_blank" rel="noopener noreferrer" className="tdnone" href={patreonPage}>
                <Button className="db ma btn-patreon">Patreon</Button>
              </a>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
    </Col>
  )
}

About.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
