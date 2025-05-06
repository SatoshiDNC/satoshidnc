import { sfx } from './js/sound.js'

const TAG = 'sw-minutely'

export function minutelyTasks() {
  console.log(`[${TAG}] no-op`)
  sfx('new update', false)
}
