/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Canvas from './components/Canvas'
import Chat from './components/Chat'
import MyModal from './components/MyModal'
import Welcome from './components/Welcome'

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
    this.onWelcomeDone = this.onWelcomeDone.bind(this)

    const tokenManager = this.brain.ask.Tokens
    const token = tokenManager.getToken()

    this.state = {
      loggedIn: token && !tokenManager.isTokenExpired(),
      ready: false,
    }

    this.customMessages = {
      loggingIn: 'Logging in',
      connecting: 'Connecting to socket server',
      logInFail: 'Failed to log in',
      logInSuccess: 'Successfully logged in',
      connectSuccess: 'Successfully connected to socket server',
      invalidToken: 'Socket server rejected your token. Try refreshing the page to generate a new one',
    }

    const { loggedIn } = this.state
    if (!loggedIn) {
      // fetch new token first
      tokenManager.fetchToken((err, tk, msg, badErr) => {
        if (badErr) {
          // a bad error is an http error, something like
          // the lambda function responding with forbidden or something
          this.brain.tell.Welcome.addMessage({
            warning: this.customMessages.logInFail,
          }, true)
          this.brain.tell.Welcome.addMessage({
            error: typeof badErr === 'object' ? badErr.message : badErr,
          })
          this.brain.tell.Welcome.welcomeDone()
        } else if (err) {
          // a regular error is something possibly expected like
          // ip limit, or database being unavailable for some reason
          // in this case, I still want to allow access to the site, just
          // with a token that doesnt allow chatting/popping
          this.brain.tell.Welcome.addMessage({
            warning: this.customMessages.logInFail,
          }, true)
          this.brain.tell.Welcome.addMessage({
            warning: typeof err === 'object' ? err.message : err,
          })

          // TODO: Implement this on socket server
          this.brain.tell.Tokens.storeToken('notoken')
          this.afterLogIn()
        } else if (tk && msg) {
          // if token, and also warning messsage
          // tell user something about how someone might
          // have used their token!
          this.brain.tell.Welcome.addMessage({
            message: this.customMessages.logInSuccess,
            warning: msg,
          }, true)
          this.brain.tell.Welcome.addMessage(this.customMessages.connecting)

          tokenManager.storeToken(tk)
          this.afterLogIn()
        } else if (tk) {
          // if just the token then everything is good
          this.brain.tell.Welcome.addMessage(this.customMessages.logInSuccess)
          this.brain.tell.Welcome.addMessage(this.customMessages.connecting)
          tokenManager.storeToken(tk)
          this.afterLogIn()
        }
      })
    } else {
      // already logged in
      this.afterLogIn()
    }
  }

  onWelcomeDone() {
    this.setState({ ready: true })
  }

  afterLogIn() {
    const token = this.brain.ask.Tokens.getToken()

    this.brain.tell.Sockets.connect(token, (socket) => {
      console.log('connected')
      socket.emit('sni', '')
      socket.on('sno', (sn) => {
        console.log(`got servername: ${sn}`)
        this.brain.tell.Welcome.addMessage(this.customMessages.connectSuccess)
        this.brain.tell.Welcome.welcomeDone()
      })

      socket.on('it', () => {
        // invalid token
        this.brain.tell.Tokens.removeToken()
        this.brain.tell.Welcome.addMessage({
          error: this.customMessages.invalidToken,
        }, true)
        this.brain.tell.Welcome.welcomeDone()
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
    const { loggedIn, ready } = this.state
    const { connecting, loggingIn } = this.customMessages
    if (!ready) {
      // otherwise render placceholder while we are fetching the token
      // and connecting to socket server
      const msg = !loggedIn ? loggingIn : connecting
      return <Welcome callback={this.onWelcomeDone} initialMessage={msg} brain={this.brain} />
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
