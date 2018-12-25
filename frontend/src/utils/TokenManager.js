import {
  loginEndpoint,
} from '../customConfig'

function TokenManager(datastore) {
  const brain = datastore
  let token = ''

  const retObj = {
    
  }

  brain.store('Tokens', retObj)
  return retObj
}

export default TokenManager
