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

function encode_b58(hex_number) {
  // Set of base58 chars (Note: there is no '0','O','I' or 'l').
  const base58 = [1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
  //Take input string of hexadecimal bytes and convert it to a base 10
  //decimal number. BigInt needed as regular JS numbers don't represent enough significant digits.
  var num = BigInt('0x' + hex_number)
  //Our very large number will be repeatedly divided by 58.
  const fifty8 = BigInt(58)
  //The remainder of this division will be a number (0-57).
  var remainder
  //Each remainder's value maps to a character in our base58 array, and
  //the string of these characters becomes our Base58 encoded output.
  var b58_encoded_buffer = ''
  //We move from: Hex Bytes -> Decimal Number -> Base58 Encoded string.
  //To move through each place value of a base58 number, we continue to
  //divide by 58, until the integer number rounds down to 0.
  while (num > 0) {
      //The modulus operator returns our remainder, which depends on
      //the least significant digit in our BigInt converted input.
      //For example: if we were doing modulo 2 division, all odd
      //numbers - regardless of how long they are - would return a
      //remainder of 1, because the least significant digit is odd.
      remainder = num % fifty8

      //Thus, we're encoding the right most (lowest place value)
      //digits first, and so each subsequently encoded character
      //needs to be added to the left of our encoded buffer
      //so that the beginning & end of our input string/bytes aligns
      //with the beginning & end of our Base58 encoded output.
      b58_encoded_buffer = base58[remainder] + b58_encoded_buffer

      //Dividing by 58 gives us our quotient (rounded down to the
      //nearest integer), and moves us over one base58 place value,
      //ready for the next round of b58 division/mapping/encoding.
      num = num/BigInt(58)
  }

  //When we convert our byte-based hex input into a base 10 number, we
  //lose the leading zero bytes in the converted decimal number.
  //For example, if our hex input converted into the decimal number
  //000017, this number would be reduced automatically to 17 in base10,
  //and so we'd lose the leading zeros, which aren't important
  //when doing base 10 math, but are important in preserving the
  //information held in our original input value. So, in order to not
  //lose the leading zeros, we count them, and then prepend them (as
  //1's, which is their corresponding base58 value) to the beginning
  //of our Base58 encoded output string.
  while ( hex_number.match(/^00/) ) {
      //For each leading zero byte, add a '1' to the encoded output.
      b58_encoded_buffer = '1' + b58_encoded_buffer
      //And remove the leading zero byte, and test for another.
      hex_number = hex_number.substring(2)
  }

  return b58_encoded_buffer
}

function decode_b58(b58_string) {
  // Set of base58 chars (Note: there is no '0','O','I' or 'l').
  const base58 = ['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
  const b58_array = b58_string.split('').map(c => base58.indexOf(c))
  let num = BigInt(0)
  while (b58_array.length > 0) {
    num = num * BigInt(58) + BigInt(b58_array.splice(0,1)[0])
  }
  var remainder
  var byte_encoded_buffer = []
  while (num > 0) {
    remainder = num % BigInt(256)
    byte_encoded_buffer.splice(0,0,Number(remainder))
    num = num/BigInt(256)
  }
  return byte_encoded_buffer
}

const readFunc = () => {
  return new Promise((resolve, reject) => {
    device.transferIn(1, 64).then(res => {
      const d = new Uint8Array(res.data.buffer)
      if (new TextDecoder().decode(d.slice(0,3)) == '?##') {
        const msgType = d[3]*256 + d[4]
        let remaining = d[5]*16777216 + d[6]*65536 + d[7]*256 + d[8]
        let payload = []
        payload.splice(payload.length, 0, ...d.slice(9,9 + Math.min(55, remaining)))
        remaining -= 55
        const finisher = msg => {
          switch (msgType) {
            case OUT_Failure: resolve({ msgType, ...msgFailure(msg) }); break
            case OUT_Success: resolve({ msgType, ...msgSuccess(msg) }); break
            case OUT_ButtonRequest: resolve({ msgType, ...msgButtonRequest(msg) }); break
            case OUT_Features: resolve({ msgType, ...msgFeatures(msg) }); break
            case OUT_PublicKey: resolve({ msgType, ...msgPublicKey(msg) }); break
            case OUT_MessageSignature: resolve({ msgType, ...msgMessageSignature(msg) }); break
            default: reject(`unexpected response from Trezor: ${msgType}`)
          }
        }
        const readMore = finisher => {
          device.transferIn(1, 64).then(res => {
            const d = new Uint8Array(res.data.buffer)
            if (new TextDecoder().decode(d.slice(0,1)) == '?') {
              payload.splice(payload.length, 0, ...d.slice(1,1 + Math.min(63, remaining)))
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
          readMore(finisher)
        } else {
          finisher(payload)
        }
      }
    })
  })
}

function readVarInt(data) {
  console.log('readVarInt', data)
  let n = 0
  let x = 0
  while (n < data.length && (data[n] & 0x80) !== 0) {
    console.log(x.toString(16), '->', (data[n] & 0x7f) * (128 ** n))
    x += (data[n] & 0x7f) * (128 ^ n)
    n++
  }
  console.log(x.toString(16), '->', (data[n] & 0x7f) * (128 ** n))
  x += (data[n] & 0x7f) * (128 ^ n)
  n++
  data.splice(0, n)
  return x
}

function readBuf(data, len) {
  return data.splice(0, len)
}

function readType(data, type) {
  console.log('reading type', type)
  switch (type) {
    case 0: return readVarInt(data)
    case 1: return readBuf(data, 8)
    case 2:
      let len = readVarInt(data)
      return readBuf(data, len)
    case 5: return readBuf(data, 4)
    default: 
      console.log('unhandled readtype', type, data)
  }
}

function readTLV(data) {
  let tag = readVarInt(data)
  let param = tag >> 3
  let type = tag & 0x7
  let value = readType(data, type)
  console.log('TLV', param, type, value )
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

function msgFeatures(msg) {
  console.log('features', msg)
  let safetyCheckLevel
  while (msg.length > 0) {
    let { param, type, value } = readTLV(msg)
    switch (param) {
      case 37: safetyCheckLevel = value; break
    }
  }
  return { safetyCheckLevel }
}

function readHDNodeType(msg) {
  // required uint32 depth = 1;
  // required uint32 fingerprint = 2;
  // required uint32 child_num = 3;
  // required bytes chain_code = 4;
  // optional bytes private_key = 5;
  // required bytes public_key = 6;
  let depth, fingerprint, child, chainCode, privateKey, publicKey
  while (msg.length > 0) {
    let { param, type, value } = readTLV(msg)
    switch (param) {
      case 1: depth = value; break
      case 2: fingerprint = value; break
      case 3: child = value; break
      case 4: chainCode = value; break
      case 5: privateKey = value; break
      case 6: publicKey = value; break
    }
  }
  return { depth, fingerprint, child, chainCode, privateKey, publicKey }
}

function msgPublicKey(msg) {
  // required common.HDNodeType node = 1;        // BIP-32 public node
  // required string xpub = 2;                   // serialized form of public node
  // optional uint32 root_fingerprint = 3;       // master root node fingerprint
  // optional string descriptor = 4;             // BIP-380 descriptor
  let nodeType, xpub, rootFingerprint, descriptor
  while (msg.length > 0) {
    let { param, type, value } = readTLV(msg)
    switch (param) {
      case 1: nodeType = readHDNodeType(value); break
      case 2: xpub = new TextDecoder().decode(new Uint8Array(value).buffer); break
      case 3: rootFingerprint = value; break
      case 4: descriptor = value; break
    }
  }
  return { nodeType, xpub, xpubRaw: decode_b58(xpub), rootFingerprint, descriptor }
}

function msgMessageSignature(msg) {
  let address, sig
  while (msg.length > 0) {
    let { param, type, value } = readTLV(msg)
    switch (param) {
      case 1: address = new TextDecoder().decode(new Uint8Array(value).buffer); break
      case 2: sig = value; break
    }
  }
  return { address, sig }
}

function twoByte(n) {
  return [(n / 0x100) & 0xff, n & 0xff]
}
function fourByte(n) {
  return [(n / 0x1000000) & 0xff, (n / 0x10000) & 0xff, (n / 0x100) & 0xff, n & 0xff]
}

function varInt(v) {
  const a = []
  while (v > 0x7f) {
    a.push(0x80 | (v & 0x7f))
    v = (v >>> 7)
  }
  a.push(v)
  return a
}
function paramVarInt(param, v) {
  return [...varInt(param * 8 + 0), ...varInt(v)]
}
function paramString(param, text) {
  return [...varInt(param * 8 + 2), ...varInt(text.length), ...new TextEncoder().encode(text)]
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

const handleResult = r => {
  return readFunc().then(json => {
    return new Promise((resolve, reject) => {
      resolve(json)
    })
  })
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

export function trezorRestore() {
  return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_RecoveryDevice), ...fourByte(0)])).then(r => {
    return handleButtonsAndResult(r)
  })
}

export function trezorGetNostrPubKey() {
  return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_Initialize), ...fourByte(0)])).then(r => {
    return handleResult(r).then(() => {
      const buf = [
        ...paramVarInt(1, (  44 | 0x80000000) >>> 0), // 44' hardened purpose code (BIP 43/44)
        ...paramVarInt(1, (1237 | 0x80000000) >>> 0), // 1237' hardened wallet type = Nostr (BIP 44/SLIP 44)
        ...paramVarInt(1, (   0 | 0x80000000) >>> 0), // 0' hardened account number (BIP 44)
        ...paramVarInt(1, 0), // 0 non-hardened (non-)change slot
        ...paramVarInt(1, 0), // non-hardened address slot
        ...paramVarInt(3, 1), // show on display
      ]
      return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_GetPublicKey), ...fourByte(buf.length), ...buf])).then(r => {
        return handleButtonsAndResult(r)
      })
    })
  })
}

export function trezorSign(message) {
  return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_Initialize), ...fourByte(0)])).then(r => {
    return handleResult(r).then(msg => {
      console.log('features:', msg)
      const buf = [
        ...paramVarInt(9, 1), // safety checks: prompt always
      ]
      return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_ApplySettings), ...fourByte(buf.length), ...buf])).then(r => {
        return handleButtonsAndResult(r).then(() => {
          const buf = [
            ...paramVarInt(1, (  44 | 0x80000000) >>> 0), // 44' hardened purpose code (BIP 43/44)
            ...paramVarInt(1, (1237 | 0x80000000) >>> 0), // 1237' hardened wallet type = Nostr (BIP 44/SLIP 44)
            ...paramVarInt(1, (   0 | 0x80000000) >>> 0), // 0' hardened account number (BIP 44)
            ...paramVarInt(1, 0), // 0 non-hardened (non-)change slot
            ...paramVarInt(1, 0), // non-hardened address slot
            ...paramString(2, message), // message to sign
          ]
          return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_SignMessage), ...fourByte(buf.length), ...buf])).then(r => {
            return handleButtonsAndResult(r)
          })
        })
      })
    })
  })
}

export function trezorWipe() {
  return device.transferOut(1, new Uint8Array([...new TextEncoder().encode('?##'), ...twoByte(IN_WipeDevice), ...fourByte(0)])).then(r => {
    return handleButtonsAndResult(r)
  })
}
