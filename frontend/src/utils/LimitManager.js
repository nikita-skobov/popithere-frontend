function LimitManager(datastore) {
  const brain = datastore

  const has = Object.prototype.hasOwnProperty

  const counter = {}

  const retObj = {
    canPerformAction: (type) => {
      const actionCounter = counter[type]
      const { limit, limiter, interval } = actionCounter
      if (limiter.length === 0) {
        // initial action, so yes it is allowed
        limiter.push(Date.now())
        limiter.push(1)
        return true
      }

      const previousTime = limiter[0]
      const thisTime = Date.now()
      if (thisTime - previousTime > interval) {
        // if it has been past the interval, then reset to allowed
        limiter[0] = Date.now()
        limiter[1] = 1
        return true
      }

      if (limiter[1] >= limit) return false

      // otherwise we are still within the limit, so just increment and allow
      limiter[1] += 1
      return true
    },
    setLimit: (name, interval, limit) => {
      if (!has.call(counter, name)) {
        // dont want to override a previously existing limit
        counter[name] = {
          limiter: [],
          limit,
          interval,
        }
      }
    },
  }

  brain.store('LimitManager', retObj)
  return retObj
}

export default LimitManager
