export const IN_Initialize = 0
export const IN_Ping = 1
export const OUT_Success = 2
export const OUT_Failure = 3
export const IN_ChangePin = 4
export const IN_WipeDevice = 5
export const BL_IN_FirmwareErase = 6
export const BL_IN_FirmwareUpload = 7
export const BL_OUT_FirmwareRequest = 8
export const IN_GetEntropy = 9
export const OUT_Entropy = 10
export const IN_GetPublicKey = 11
export const OUT_PublicKey = 12
export const IN_LoadDevice = 13
export const IN_ResetDevice = 14
export const IN_SignTx = 15
export const X_IN_SimpleSignTx = 16
export const OUT_Features = 17
export const OUT_PinMatrixRequest = 18
export const IN_PinMatrixAck_TINY = 19
export const IN_Cancel = 20
export const OUT_TxRequest = 21
export const IN_TxAck = 22
export const IN_CipherKeyValue = 23
export const IN_ClearSession = 24
export const IN_ApplySettings = 25
export const OUT_ButtonRequest = 26
export const IN_ButtonAck_TINY = 27
export const IN_ApplyFlags = 28
export const IN_GetAddress = 29
export const OUT_Address = 30
export const BL_IN_SelfTest = 32
export const IN_BackupDevice = 34
export const OUT_EntropyRequest = 35
export const IN_EntropyAck = 36
export const IN_SignMessage = 38
export const IN_VerifyMessage = 39
export const OUT_MessageSignature = 40
export const OUT_PassphraseRequest = 41
export const IN_PassphraseAck_TINY = 42
export const OUT_PassphraseStateRequest = 77
export const IN_PassphraseStateAck_TINY = 78
export const X_IN_EstimateTxSize = 43
export const X_OUT_TxSize = 44
export const IN_RecoveryDevice = 45
export const OUT_WordRequest = 46
export const IN_WordAck = 47
export const OUT_CipheredKeyValue = 48
export const X_IN_EncryptMessage = 49
export const X_OUT_EncryptedMessage = 50
export const X_IN_DecryptMessage = 51
export const X_OUT_DecryptedMessage = 52
export const IN_SignIdentity = 53
export const OUT_SignedIdentity = 54
export const IN_GetFeatures = 55
export const IN_EthereumGetAddress = 56
export const OUT_EthereumAddress = 57
export const IN_EthereumSignTx = 58
export const OUT_EthereumTxRequest = 59
export const IN_EthereumTxAck = 60
export const IN_GetECDHSessionKey = 61
export const OUT_ECDHSessionKey = 62
export const IN_SetU2FCounter = 63
export const IN_EthereumSignMessage = 64
export const IN_EthereumVerifyMessage = 65
export const OUT_EthereumMessageSignature = 66
export const IN_NEMGetAddress = 67
export const OUT_NEMAddress = 68
export const IN_NEMSignTx = 69
export const OUT_NEMSignedTx = 70
export const IN_CosiCommit = 71
export const OUT_CosiCommitment = 72
export const IN_CosiSign = 73
export const OUT_CosiSignature = 74
export const IN_NEMDecryptMessage = 75
export const OUT_NEMDecryptedMessage = 76
export const D_IN_DebugLinkDecision_TINY = 100
export const D_IN_DebugLinkGetState = 101
export const D_OUT_DebugLinkState = 102
export const D_IN_DebugLinkStop = 103
export const D_OUT_DebugLinkLog = 104
export const D_IN_DebugLinkMemoryRead = 110
export const D_OUT_DebugLinkMemory = 111
export const D_IN_DebugLinkMemoryWrite = 112
export const D_IN_DebugLinkFlashErase = 113

const readFunc = () => {
  console.log('readFunc')
  return new Promise((resolve, reject) => {
    console.log('readFunc promise')
    device.transferIn(1, 64).then(res => {
      console.log('transferIn', res)
      const d = new Uint8Array(res.data.buffer)
      if (new TextDecoder().decode(d.slice(0,3)) == '?##') {
        console.log('detected frame 1', res)
        const msgType = d[3]*256 + d[4]
        let remaining = d[5]*16777216 + d[6]*65536 + d[7]*256 + d[8]
        let payload = []
        payload.splice(0, 0, ...d.slice(9,9 + Math.min(55, remaining)))
        remaining -= 55
        const finisher = msg => {
          switch (msgType) {
            case OUT_Failure: resolve({ msgType, ...msgFailure(msg) }); break
            case OUT_Success: resolve({ msgType, ...msgSuccess(msg) }); break
            case OUT_ButtonRequest: resolve({ msgType, ...msgButtonRequest(msg) }); break
            default: reject(`unexpected response from Trezor: ${msgType}`)
          }
        }
        const readMore = finisher => {
          device.transferIn(1, 64).then(res => {
            console.log('readMore transferIn', res)
            const d = new Uint8Array(res.data.buffer)
            if (new TextDecoder().decode(d.slice(0,1)) == '?') {
              console.log('detected frame N', res)
              payload.splice(0, 0, ...d.slice(1,1 + Math.min(63, remaining)))
              remaining -= 63
              if (remaining > 0) {
                readMore(finisher)
              } else {
                finisher(payload)
              }
            } else {
              reject('protocol error while reading from Trezor')
            }
          })
        }
        if (remaining > 0) {
          console.log('readMore')
          readMore(finisher)
        } else {
          console.log('finisher', payload)
          finisher(payload)
        }
      }
    })
  })
}

function readVarInt(data) {
  let n = 0
  let x = 0
  while (n < data.length && (data[n] & 0x80) !== 0) {
    x = x * 128 + (data[n] & 0x7f)
    n++
  }
  x = x * 128 + (data[n] & 0x7f)
  n++
  data.splice(0, n)
  return x
}

function readBuf(data, len) {
  return data.splice(0, len)
}

function readType(data, type) {
  switch (type) {
    case 0:
      return readVarInt(data)
    case 2:
      let len = readVarInt(data)
      return readBuf(data, len)
    default: 
      console.log('unhandled readtype', type, data)
  }
}

function readTLV(data) {
  let tag = readVarInt(data)
  let param = tag >> 3
  let type = tag & 0x7
  let value = readType(data, type)
  return { param, type, value }
}

function msgFailure(msg) {
  let code
  let message
  while (msg.length > 0) {
    let { param, type, value } = readTLV(msg)
    switch (param) {
      case 1:
        code = value
        break
      case 2:
        message = new TextDecoder().decode(new Uint8Array(value).buffer)
        break
    }
  }
  return { code, message }
}

function msgSuccess(msg) {
  let message
  while (msg.length > 0) {
    let { param, type, value } = readTLV(msg)
    switch (param) {
      case 1:
        message = new TextDecoder().decode(new Uint8Array(value).buffer)
        break
    }
  }
  return { message }
}

function msgButtonRequest(msg) {
  let pages, name
  while (msg.length > 0) {
    let { param, type, value } = readTLV(msg)
    switch (param) {
      case 2:
        pages = value
        break
      case 4:
        name = new TextDecoder().decode(new Uint8Array(value).buffer)
        break
    }
  }
  return { pages, name }
}

function twoByte(n) {
  return [(n / 0x100) & 0xff, n & 0xff]
}
function fourByte(n) {
  return [(n / 0x1000000) & 0xff, (n / 0x10000) & 0xff, (n / 0x100) & 0xff, n & 0xff]
}

function varInt(v) {
  if (v < 128) return [v]
  if (v < 128 * 128) return [(v >> 7) & 0x7f, v & 0x7f]
  if (v < 128 * 128 * 128) return [(v >> 14) & 0x7f, (v >> 7) & 0x7f, v & 0x7f]
  if (v < 128 * 128 * 128 * 128) return [(v >> 21) & 0x7f, (v >> 14) & 0x7f, (v >> 7) & 0x7f, v & 0x7f]
  if (v < 128 * 128 * 128 * 128 * 128) return [(v >> 28) & 0x7f, (v >> 21) & 0x7f, (v >> 14) & 0x7f, (v >> 7) & 0x7f, v & 0x7f]
}
function paramVarInt(param, v) {
  return [...varInt(param * 8 + 0), varInt(v)]
}
function paramString(param, text) {
  return [...varInt(param * 8 + 2), varInt(text.length), ...new TextEncoder().encode(text)]
}

let device
export function trezorConnect() {
  return new Promise((resolve, reject) => {
    navigator.usb.requestDevice({ filters: [{ vendorId: 4617 }] }).then(selectedDevice => {
      device = selectedDevice
      return device.open()
    }).then(() => {
      return device.claimInterface(0)
    }).then(() => {
      resolve()
    }).catch(e => {
      reject(e)
    })
  })
}

export function trezorPing(text) {
  return new Promise((resolve, reject) => {
    const buf = paramString(1, text)
    device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_Ping), ...fourByte(buf.length), ...buf])).then(d => {
      return readFunc()
    }).then(json => {
      resolve(json)
    }).catch(e => {
      reject(e)
    })
  })
}

const handleButtonsAndResult = r => {
  return readFunc().then(json => {
    if (json.msgType == OUT_ButtonRequest) {
      return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_ButtonAck_TINY), ...fourByte(0)])).then(r => {
        return handleButtonsAndResult(r)
      })
    } else {
      return new Promise((resolve, reject) => {
        resolve(json)
      })
    }
  })
}

// const handleButtonsAndResult = () => {
//   return new Promise((resolve, reject) => {
//     readFunc().then(json => {
//       resolve(handleButtons(json))
//     }).catch(e => {
//       reject(e)
//     })
//   })
// }

const handleResult = r => {
  console.log('handleResult')
  return readFunc().then(json => {
    console.log('handleResult readFunc', json)
    return new Promise((resolve, reject) => {
      resolve(json)
    })
  })
}

export function trezorRestore() {
  return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_RecoveryDevice), ...fourByte(0)])).then(r => {
    return handleButtonsAndResult(r)
  })
}

export function trezorGetNostrPubKey() {
  console.log('trezorGetNostrPubKey')
  return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_Initialize), ...fourByte(0)])).then(r => {
    console.log('trezorGetNostrPubKey transferOut result', r)
    return handleResult(r)
  })
  
  // const buf = [
  //   ...paramVarInt(1, (  44 | 0x80000000) >>> 0), // 44' hardened purpose code (BIP 43/44)
  //   ...paramVarInt(1, (1237 | 0x80000000) >>> 0), // 1237' hardened wallet type = Nostr (BIP 44/SLIP 44)
  //   ...paramVarInt(1, (   0 | 0x80000000) >>> 0), // 0' hardened account number (BIP 44)
  // ]
  // return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_GetPublicKey), ...fourByte(buf.length), ...buf])).then(r => {
  //   return handleResult(r)
  // })
}

export function trezorWipe() {
  return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_WipeDevice), ...fourByte(0)])).then(r => {
    return handleButtonsAndResult(r)
  })
}
