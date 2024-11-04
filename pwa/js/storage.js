import { Buffer } from 'buffer'

export const storageSystems = []

storageSystems.push({
  auth: 'nip-98',
  url: 'https://nostrcheck.me/api/v2/media',
  method: 'POST',
})

export function encrypt(stream) {
  const TAG = 'enc'
  const { readable, writable } = new TransformStream()
  return new Promise((resolve, reject) => {
    console.log(`[${TAG}] got stream`)
    const reader = stream.getReader()
    const writer = writable.getWriter()
    const readFunc = () => {
      console.log(`[${TAG}] read`)
      reader.read().then(({ done, value }) => {
        if (value) {
          console.log(`[${TAG}] ${value}`)
          writer.write(value).then(() => {
            readFunc()
          })
        } else if (done) {
          console.log(`[${TAG}] done`)
          writer.close()
        } else {
          console.log(`[${TAG}] invalid data`)
        }
      }, reason => {
        console.log(`[${TAG}] read error: ${reason}`)
      })
    }
    readFunc()
    resolve(readable)

    // var key = new Buffer(32)
    // key.fill(0)
    // var nonce = new Buffer(8)
    // nonce.fill(0)
    // chacha20.encrypt(key, nonce, new Buffer(plaintext))
  })
}