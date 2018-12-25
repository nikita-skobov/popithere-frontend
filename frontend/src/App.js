/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Canvas from './components/Canvas'
import Chat from './components/Chat'
import MyModal from './components/MyModal'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    const iw = window.innerWidth
    const ih = window.innerHeight

    this.orientation = iw > ih ? 'landscape' : 'portrait'

    this.brain.store('App', this)

    this.shouldResize = this.shouldResize.bind(this)
    this.afterLogIn = this.afterLogIn.bind(this)

    const tokenManager = this.brain.ask.Tokens
    const token = tokenManager.getToken()

    this.state = {
      loggedIn: token && !tokenManager.isTokenExpired(),
      connected: this.brain.ask.Sockets.isConnected(),
    }

    const { loggedIn } = this.state
    if (!loggedIn) {
      // fetch new token first
      tokenManager.fetchToken((err, tk, msg) => {
        if (err) {
          // handle this later lmao
          console.log(err)
        } else if (tk && msg) {
          // if token, and also warning messsage
          // tell user something about how someone might
          // have used their token!
          console.log('DID SOMEBODY USE YOUR TOKEN????')
          console.log(msg)
          tokenManager.storeToken(tk)
          this.afterLogIn()
        } else if (tk) {
          // if just the token then everything is good
          tokenManager.storeToken(tk)
          this.afterLogIn()
        }
      })
    } else {
      // already logged in
      this.afterLogIn()
    }
  }

  afterLogIn() {
    const token = this.brain.ask.Tokens.getToken()
    this.setState({ loggedIn: true })

    this.brain.tell.Sockets.connect(token, (socket) => {
      this.setState({ connected: true })
      console.log('connected')
      socket.emit('sni', '')
      socket.on('sno', (sn) => {
        console.log(`got servername: ${sn}`)
      })
    })
  }

  shouldResize(iw, ih) {
    // inner width, inner height
    let should = false
    let { orientation } = this
    if (orientation === 'landscape' && iw < ih) {
      should = true
      orientation = 'portrait'
    } else if (orientation === 'portrait' && ih < iw) {
      should = true
      orientation = 'landscape'
    }

    this.orientation = orientation
    return should
  }

  render() {
    const { loggedIn, connected } = this.state
    if (!loggedIn) {
      // otherwise render placceholder while we are fetching the token
      return <div>logging in please wait</div>
    }

    if (!connected) {
      return <div>Connecting to socket server. please wait</div>
    }

    return [
      <Canvas brain={this.brain} />,
      <Chat brain={this.brain} />,
      <MyModal brain={this.brain} />,
    ]
  }
}

App.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
