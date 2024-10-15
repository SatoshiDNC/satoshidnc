import { nostrWatchRelays } from './nostor.js'
import { init as dbInit } from '../db.js'
import { relays, detectRelay } from '../relays.js'

const TAG = 'START'
export function startupTasks() {
  dbInit().then(() => {
    return nostrWatchRelays()
  }, error => {
    console.log(`[${TAG}] database error: ${error}`)
  }).then(onlineRelays => {
    onlineRelays.map(relay => {
      if (!relays.includes(relay)) {
        console.log(`[${TAG}] cognized new relay: ${JSON.stringify(relay)}`)
        detectRelay(relay)
      }
    })
  }, error => {
    console.log(`[${TAG}] couldn't get relay list: ${error}`)
  })
}
