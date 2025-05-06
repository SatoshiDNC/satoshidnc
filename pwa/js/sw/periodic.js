const TAG = 'sw-minutely'

export function minutelyTasks() {
  console.log(`[${TAG}] no-op`)
  self.clients.matchAll().then(list => {
    list[0]?.postMessage({ note: 'this is a test'})
  })
}
