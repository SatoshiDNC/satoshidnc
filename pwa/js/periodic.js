import { reqFeed } from '../content.js'

export function minutelyUI() {
  console.log('run minutely UI tasks')
  reqFeed()
}
