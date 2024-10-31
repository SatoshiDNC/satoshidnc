import { homeRelay } from './nostor-app.js'
import { reqFeed } from './content.js'

export function minutelyUI() {
  homeRelay().then(relay => {
    if (!relay.feedRequested) {
      reqFeed()
      relay.feedRequested = true
    }
  })
}
