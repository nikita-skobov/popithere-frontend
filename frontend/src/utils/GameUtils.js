import * as PIXI from 'pixi.js'
import { createRoot } from './PixiUtils'
import PopItHere from '../Games/PopItHere'

/**
 * @todo write a fetch helper
 * to fetch the current game from a server
 */
export function getCurrentGame({ renderer, modal, canvas, limitMan, dataMan, socket, uploader }) {
  const root = createRoot(renderer, { interactive: true })

  const modalInner = {
    // here we only want the Game instance
    // to have access to isOpen and toggle. we don't want
    // to give Game access to setState, render, etc.
    isOpen: modal.isOpen,
    toggle: modal.toggle,
  }

  const socketInner = {
    // only let user emit, and receive messages
    // dont allow connect/disconnect handling
    on: socket.on,
    off: socket.off,
    emit: socket.emit,
  }

  const canvasInner = {
    // only give game access to certain canvas methods
    endGame: canvas.endGame,
    newButtons: canvas.newButtons,
  }

  const uploadInner = {
    storeData: uploader.storeData,
    clearData: uploader.clearData,
    uploadData: uploader.uploadData,
  }

  const dataInner = {
    getDataNow: dataMan.getDataNow,
    getDataLater: dataMan.getDataLater,
    getDataNumbers: dataMan.getDataNumbers,
    fetchList: dataMan.fetchList,
  }

  const limitInner = {
    canPerformAction: (type) => {
      if (type !== 'chat') {
        // prevent game class from affecting chat limit
        return undefined
      }
      return limitMan.canPerformAction(type)
    },
    setLimit: limitMan.setLimit,
  }

  return new PopItHere({
    renderer,
    root,
    socket: socketInner,
    modal: modalInner,
    canvas: canvasInner,
    uploader: uploadInner,
    dataMan: dataInner,
    limitMan: limitInner,
  })
}

export function getLocalPosition(event, root) {
  return event.data.getLocalPosition(root)
}

export function makeRandomId(size) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const iterator = [...Array(size).keys()]

  const text = iterator.reduce(prevText => `${prevText}${possible.charAt(Math.floor(Math.random() * possible.length))}`)

  return text
}

export function calculateCenterPosition(name, clickPos) {
  let width
  let height
  if (typeof name === 'string') {
    ({ width, height } = PIXI.loader.resources[name].texture)
  } else {
    // in this case, name is already a texture
    ({ width, height } = name)
  }
  // calculate the center by dividing the texture width & height half
  return { x: clickPos.x - (width / 2), y: clickPos.y - (height / 2) }
}

export function reduceFrames(frames, max) {
  const avg = frames.length / max
  const reduce = avg > 1
  const spreadFactor = !reduce && Math.ceil(max / frames.length)
  const newFrames = []
  let runCount = avg
  frames.forEach((frame, index) => {
    if (index === 0) {
      // always start with initial framme
      newFrames.push(frame)
      return
    }

    if (reduce) {
      // if we are reducing a large array into a smaller array
      if (index >= runCount && newFrames.length < max) {
        newFrames.push(frame)
        runCount += avg
      }
    } else {
      // if we are taking a smaller array and spreading it out
      const iterator = [...Array(spreadFactor).keys()]
      // this puts in {spreadFactor} copies of the current frame
      iterator.forEach(() => {
        if (newFrames.length < max) {
          newFrames.push(frame)
        }
      })
    }
  })
  return newFrames
}
