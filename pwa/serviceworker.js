import { minutelyTasks } from './js/periodic.js'

self.addEventListener('install', event => {
  console.log('Service worker installed')
})
self.addEventListener('activate', event => {
  console.log('Service worker activated')
})
const MINUTE = 60 * 1000
let minutely
self.addEventListener('sync', event => {
  let now = Date.now()
  switch (event.tag) {
    case 'minutely':
      if (minutely && now - minutely < MINUTE) break
      minutely = now
      minutelyTasks()
      break
    default:
      console.log('sync', event.tag)
  }
})
self.addEventListener('periodicsync', event => {
  console.log('periodicsync', event.tag)
  // if (event.tag === 'sync-messages') {
  //   event.waitUntil(sendMessages())
  // }
})
