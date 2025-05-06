const TAG = 'sw-minutely'

export function minutelyTasks() {
  console.log(`[${TAG}] no-op`)
  console.log(self.clients.matchAll())
}
