import { getRelay } from './nostor-app.js'
import { reqFeed } from './content.js'

export function minutelyUI() {
  getRelay('relay.satoshidnc.com').then(relay => {
    if (!relay.feedRequested) {
      reqFeed()
      relay.feedRequested = true
    }
  })
}
