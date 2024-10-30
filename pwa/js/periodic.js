import { getRelay } from './nostor-app.js'
import { reqFeed } from './content.js'

export function minutelyUI() {
  console.log('run minutely UI tasks')
  getRelay('relay.satoshidnc.com').then(relay => {
    if (!relay.feedRequested) {
      reqFeed()
      relay.feedRequested = true
    }
  })
}
