import { Howl, Howler } from 'howler'

const has = Object.prototype.hasOwnProperty

function SoundManager(datastore) {
  const brain = datastore

  const sounds = {}

  const retObj = {
    addSound: (id, names) => {
      if (!has.call(sounds, id)) {
        // only add sound if it doesnt override an ID
        const sound = new Howl({
          src: names,
        })
        sounds[id] = sound
        return id
      }
      return null
    },
    playSound: (id) => {
      if (has.call(sounds, id)) {
        sounds[id].play()
        return id
      }
      return null
    },
  }

  brain.store('SoundManager', retObj)
  return retObj
}

export default SoundManager
