import { Buffer } from 'buffer'
import * as chacha20 from '../lib/chacha20.js'

export const storageSystems = []

storageSystems.push({
  auth: 'nip-98',
  url: 'https://nostrcheck.me/api/v2/media',
  method: 'POST',
})

export function encrypt(key44, stream) {
  const TAG = 'enc'
  const { readable, writable } = new TransformStream()
  const inBuf = [], outBuf = []
  let bufSize = 0, bufPos = 0, streamPos = 0
  const BLOCKSIZE = 1024
  const key = Buffer.from(key44.substring(0, 32*2), 'hex')
  const nonce = Buffer.from(key44.substring(32*2), 'hex')
  return new Promise((resolve, reject) => {
    console.log(`[${TAG}] got stream`)
    const reader = stream.getReader()
    const writer = writable.getWriter()
    const readFunc = () => {
      // console.log(`[${TAG}] read`)
      reader.read().then(({ done, value }) => {
        if (value) {
          // console.log(`[${TAG}] read ${value.length} bytes to append to buffer`)
          inBuf.push(value)
          bufSize += value.length

          // console.log(`[${TAG}] while bufSize ${bufSize} - bufPos ${bufPos} >= BLOCKSIZE ${BLOCKSIZE}`)
          while (bufSize - bufPos >= BLOCKSIZE) {

            let head = Buffer.from(inBuf[0].slice(bufPos, bufPos + BLOCKSIZE)).toString('hex')
            // console.log(`[${TAG}] head ${head.length} ${head}`)
            // console.log(`[${TAG}] bufPos ${bufPos}`)
            while (head.length < BLOCKSIZE * 2) {
              const len = inBuf.pop().length
              bufSize -= len
              bufPos -= len
              // console.log(`[${TAG}] while < BLOCKSIZE, bufSize ${bufSize} bufPos ${bufPos}`)
              head = head + Buffer.from(inBuf[0].slice(bufPos, bufPos + BLOCKSIZE)).toString('hex')
              // console.log(`[${TAG}] head ${head.length} ${head}`)
            }
            var block = Buffer.from(head.substring(0, BLOCKSIZE * 2), 'hex')
            // console.log(`[${TAG}] block ${block.length}, counter ${Math.floor(streamPos / BLOCKSIZE)}`)
            bufPos += block.length

            const cipher = new chacha20.Chacha20(key, nonce, Math.floor(streamPos / BLOCKSIZE))
            const ret = Buffer.alloc(BLOCKSIZE)
            ret.fill(0)
            cipher.encrypt(ret, block, BLOCKSIZE)
            outBuf.push(ret)
            // console.log(ret.toString('hex'))

            streamPos += BLOCKSIZE
            // console.log(`[${TAG}] streamPos ${streamPos}`)
            // console.log(`[${TAG}] while bufSize ${bufSize} - bufPos ${bufPos} >= BLOCKSIZE ${BLOCKSIZE}`)
          }

          const totalLength = outBuf.reduce((p,c) => p + c.length, 0)
          const data = new Uint8Array(totalLength)
          let o = 0
          for (const b of outBuf) {
            data.set(b, o)
            o += b.length
          }
          // console.log(`writing ${data.length} bytes`)
          if (data.length > 0) {
            writer.write(data).then(() => {
              while (outBuf.length > 0) {
                outBuf.pop()
              }
              readFunc()
            })
          } else {
            readFunc()
          }

        } else if (done) {
          console.log(`[${TAG}] done`)


            let head = Buffer.from(inBuf[0].slice(bufPos, bufPos + BLOCKSIZE)).toString('hex')
            // console.log(`[${TAG}] head ${head.length} ${head}`)
            console.log(`[${TAG}] bufPos ${bufPos}`)
            while (head.length < BLOCKSIZE * 2) {
              const len = inBuf.pop().length
              bufSize -= len
              bufPos -= len
              console.log(`[${TAG}] while < BLOCKSIZE, bufSize ${bufSize} bufPos ${bufPos}`)
              if (inBuf.length == 0) break
              head = head + Buffer.from(inBuf[0].slice(bufPos, bufPos + BLOCKSIZE)).toString('hex')
              // console.log(`[${TAG}] head ${head.length} ${head}`)
            }
            var block = Buffer.from(head.substring(0, BLOCKSIZE * 2), 'hex')
            // console.log(`[${TAG}] block ${block.length}, counter ${Math.floor(streamPos / BLOCKSIZE)}`)
            bufPos += block.length

            const cipher = new chacha20.Chacha20(key, nonce, Math.floor(streamPos / BLOCKSIZE))
            const ret = Buffer.alloc(block.length)
            ret.fill(0)
            cipher.encrypt(ret, block, block.length)
            outBuf.push(ret)
            // console.log(ret.toString('hex'))

            streamPos += block.length
            console.log(`[${TAG}] streamPos ${streamPos}`)

          const totalLength = outBuf.reduce((p,c) => p + c.length, 0)
          const data = new Uint8Array(totalLength)
          let o = 0
          for (const b of outBuf) {
            data.set(b, o)
            o += b.length
          }
          console.log(`writing ${data.length} bytes`)
          if (data.length > 0) {
            writer.write(data).then(() => {
              while (outBuf.length > 0) {
                outBuf.pop()
              }
            })
          }


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
  })
}

export const decrypt = encrypt
