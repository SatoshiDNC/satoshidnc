self.addEventListener('install', event => {
  console.log('Service worker installed')
})
self.addEventListener('activate', event => {
  console.log('Service worker activated')
})
const MINUTE = 60 * 1000
let minutely
self.addEventListener('sync', event => {
  console.log('sync', event.tag)
  let now = Date.now()
  console.log(now)
  switch (event.tag) {
    case 'minutely':
      console.log('a')
      if (minutely && now - minutely < MINUTE) break
      console.log('b')
      minutely = now
      minutelyTasks()
      break
    default:
      console.log('c')
  }
})
self.addEventListener('periodicsync', event => {
  console.log('periodicsync', event.tag)
  // if (event.tag === 'sync-messages') {
  //   event.waitUntil(sendMessages())
  // }
})
function minutelyTasks() {
  console.log('run minutely')
}