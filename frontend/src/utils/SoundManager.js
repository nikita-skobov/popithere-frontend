/* global window */
import { Howl, Howler } from 'howler'

const has = Object.prototype.hasOwnProperty

function SoundManager(datastore) {
  const brain = datastore

  const synth = window.speechSynthesis
  let useVoice = null
  let voiceRate = 0.85

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
    playText: (text) => {
      // some browsers dont have speechSynthesis
      const voices = synth ? synth.getVoices() : []
      voices.forEach((voice) => {
        if (voice.name === 'Microsoft Zira Desktop - English (United States)') {
          useVoice = voice
        }
      })

      try {
        const utterance = new window.SpeechSynthesisUtterance(text)

        if (useVoice) {
          utterance.voice = useVoice
        }

        utterance.rate = voiceRate
        utterance.volume = retObj.getVolume()
        synth.speak(utterance)
      } catch (e) {
        console.error('Your browser does not have Text-To-Speech support')
      }
    },
    changeVolume: (volume) => {
      Howler.volume(volume)
    },
    // eslint-disable-next-line
    getVolume: () => Howler._volume,
  }

  brain.store('SoundManager', retObj)
  return retObj
}

export default SoundManager
