import { homeRelay } from './nostor-app.js'
import { reqFeed, deleteExpiredEvents } from './content.js'
import { ONE_MINUTE_IN_MILLISECONDS } from './time.js'
import { defaultKey, sign } from './keys.js'
import { contactDependencies } from './contacts.js'

contactDependencies.push(() => {
  homeRelay().then(relay => {
    reqFeed()
    relay.feedRequested = true
  })
})

let lastFulfillment = 0
export function minutelyUI() {
  homeRelay().then(relay => {

    // floodgate
    const now = Date.now()
    if (now - lastFulfillment < ONE_MINUTE_IN_MILLISECONDS) return
    lastFulfillment = now

    if (!relay.feedRequested) {
      reqFeed()
      relay.feedRequested = true
    }

    // delete expired events
    deleteExpiredEvents().then(() => {

      // send test message
      if (now - (relay.tempLastSend||0) > 2 * ONE_MINUTE_IN_MILLISECONDS) {
        relay.tempLastSend = now
        sign(defaultKey, {
          kind: 1,
          content: `Testing ${Math.floor(now/1000/60) % 100}`,
          tags: [
            ['expiration', `${now + 4 * ONE_MINUTE_IN_MILLISECONDS}`],
          ],
        }, true).then(event => {
          relay.send(['EVENT', event])
        }).catch(reason => {
          console.error(`could not sign event: ${reason}`)
        })
      }
    })


  })
}
