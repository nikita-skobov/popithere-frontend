/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Canvas from './components/Canvas'
import Chat from './components/Chat'
import MyModal from './components/MyModal'
import Welcome from './components/Welcome'

import { DEV_MODE } from './customConfig'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    const iw = window.innerWidth
    const ih = window.innerHeight

    this.maxInitialFetch = 10 // client should only download this
    // many objects initially, and then download more as needed

    this.orientation = iw > ih ? 'landscape' : 'portrait'

    this.brain.store('App', this)

    this.shouldResize = this.shouldResize.bind(this)
    this.afterLogIn = this.afterLogIn.bind(this)
    this.afterSocketConnect = this.afterSocketConnect.bind(this)
    this.afterSocketVerification = this.afterSocketVerification.bind(this)
    this.doLogInProcess = this.doLogInProcess.bind(this)
    this.onWelcomeDone = this.onWelcomeDone.bind(this)

    const tokenManager = this.brain.ask.Tokens
    const token = tokenManager.getToken()

    this.state = {
      loggedIn: token && !tokenManager.isTokenExpired(),
      ready: false,
    }

    this.customMessages = {
      loadingAssets: 'Loading initial assets',
      loggingIn: 'Logging in',
      connecting: 'Connecting to socket server',
      logInFail: 'Failed to log in',
      logInSuccess: 'Successfully logged in',
      connectSuccess: 'Successfully connected to socket server',
      invalidToken: 'Socket server rejected your token. Try refreshing the page to generate a new one',
    }
  }

  componentDidMount() {
    const { loggedIn } = this.state
    if (!loggedIn) {
      // fetch new token first
      if (!DEV_MODE) {
        this.doLogInProcess()
      } else {
        // if developing, no need to do log in process
        this.brain.tell.Welcome.addMessage(this.customMessages.logInSuccess)
        this.brain.tell.Welcome.addMessage(this.customMessages.connecting)
        this.afterLogIn()
      }
    } else {
      // already logged in
      this.afterLogIn()
    }
  }

  onWelcomeDone() {
    this.setState({ ready: true })
  }

  doLogInProcess() {
    const tokenManager = this.brain.ask.Tokens
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
  }

  afterSocketVerification() {
    if (DEV_MODE) {
      this.brain.tell.Welcome.welcomeDone()
      return null
    }

    this.brain.ask.DataMan.fetchList((err, listSize) => {
      if (err) {
        // not sure what else to do here...
        console.error(err)
        return null
      }

      // if no error, proceed to download the objects
      // in that list
      let fetchUpTo = listSize
      if (fetchUpTo > this.maxInitialFetch) {
        fetchUpTo = this.maxInitialFetch
      }
      this.brain.ask.DataMan.fetchRange([0, fetchUpTo])
      this.brain.tell.Welcome.welcomeDone()
    })
    return null
  }

  afterSocketConnect(socket) {
    console.log('connected')

    let serverNameOut = (sn) => {
      console.log(`got servername: ${sn}`)
      this.brain.tell.Welcome.addMessage(this.customMessages.connectSuccess)
      this.brain.tell.Welcome.addMessage(this.customMessages.loadingAssets)
      // here we should fetch the new data list, only
      // after the user has been verified

      this.afterSocketVerification()
    }
    serverNameOut = serverNameOut.bind(this)

    socket.emit('sni', '')
    socket.on('sno', serverNameOut)


    let invalidTokenHandler = () => {
      // invalid token
      console.log('invalid token')
      console.log(this.brain.tell.Welcome)
      this.brain.tell.Tokens.removeToken()
      this.brain.tell.Welcome.addMessage({
        error: this.customMessages.invalidToken,
      }, true)
      this.brain.tell.Welcome.welcomeDone()
    }
    invalidTokenHandler = invalidTokenHandler.bind(this)

    socket.on('it', invalidTokenHandler)

    socket.on('disconnect', () => {
      socket.removeListener('it', invalidTokenHandler)
      socket.removeListener('sno', serverNameOut)
      socket.removeListener('disconnect')
    })
  }

  afterLogIn() {
    const token = this.brain.ask.Tokens.getToken()

    if (!DEV_MODE) {
      this.brain.tell.Sockets.connect(token, this.afterSocketConnect)
    } else {
      // if developing, no need to connect to sockets
      this.brain.tell.Welcome.addMessage(this.customMessages.connectSuccess)
      this.brain.tell.Welcome.addMessage(this.customMessages.loadingAssets)
      this.afterSocketVerification()
    }
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
      return <Welcome btnText="I Understand" callback={this.onWelcomeDone} initialMessage={msg} brain={this.brain} />
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
