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
    stream.pipeTo(writable)
    resolve(readable)
    // console.log(`[${TAG}] got stream`)
    // const reader = stream.getReader()
    // const readFunc = () => {
    //   console.log(`[${TAG}] read`)
    //   reader.read().then(({ done, value }) => {
    //     if (value) {
    //       console.log(`[${TAG}] ${value}`)
    //       readFunc()
    //     } else if (done) {
    //       console.log(`[${TAG}] done`)
    //     } else {
    //       console.log(`[${TAG}] invalid data`)
    //     }
    //   }, reason => {
    //     console.log(`[${TAG}] read error: ${reason}`)
    //   })
    // }
    // readFunc()

    // var key = new Buffer(32)
    // key.fill(0)
    // var nonce = new Buffer(8)
    // nonce.fill(0)
    // chacha20.encrypt(key, nonce, new Buffer(plaintext))
  })
}