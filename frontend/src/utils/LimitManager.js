function LimitManager(datastore) {
  const brain = datastore

  const has = Object.prototype.hasOwnProperty

  const counter = {}

  const retObj = {
    canPerformAction: (type) => {
      const actionCounter = counter[type]
      const { limit, limiter, interval } = actionCounter
      if (limit === 0) {
        // user is never allowed to do this
        return {
          allowed: false,
          limit,
          current: undefined,
          nextTime: undefined,
          interval,
        }
      }
      if (limiter.length === 0) {
        // initial action, so yes it is allowed
        limiter.push(Date.now())
        limiter.push(1)
        return {
          allowed: true,
          limit,
          current: limiter[1],
          nextTime: undefined,
          interval,
        }
      }

      const previousTime = limiter[0]
      const thisTime = Date.now()
      const timeDiff = thisTime - previousTime
      if (timeDiff > interval) {
        // if it has been past the interval, then reset to allowed
        limiter[0] = Date.now()
        limiter[1] = 1
        return {
          allowed: true,
          limit,
          current: limiter[1],
          nextTime: interval - timeDiff,
          interval,
        }
      }

      if (limiter[1] >= limit) {
        return {
          allowed: false,
          limit,
          current: limiter[1],
          nextTime: interval - timeDiff,
          interval,
        }
      }

      // otherwise we are still within the limit, so just increment and allow
      limiter[1] += 1
      return {
        allowed: true,
        limit,
        current: limiter[1],
        nextTime: interval - timeDiff,
        interval,
      }
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
