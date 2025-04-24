import * as nip19 from 'nostr-tools/nip19'
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { getKeyInfo } from './keys.js'
import { db } from './db.js'
import { Buffer } from 'buffer'

export { nostrWatchRelays } from './sw/nostor.js'

export const kindInfo = [
  { kind: 0, desc: `user metadata`, nips: [1] },
  { kind: 1, desc: `short text note`, nips: [1] },
  { kind: 2, desc: `recommend relay`, nips: [1] }, // deprecated
  { kind: 3, desc: `follows`, nips: [2] },
  { kind: 4, desc: `encrypted direct messages`, nips: [4] },
  { kind: 5, desc: `event deletion request`, nips: [9] },
  { kind: 6, desc: `repost`, nips: [18] },
  { kind: 7, desc: `reaction`, nips: [25] },
  { kind: 8, desc: `badge award`, nips: [58] },
  { kind: 9, desc: `group chat message`, nips: [29] },
  { kind: 10, desc: `group chat threaded reply`, nips: [29] },
  { kind: 11, desc: `group thread`, nips: [29] },
  { kind: 12, desc: `group thread reply`, nips: [29] },
  { kind: 13, desc: `seal`, nips: [59] },
  { kind: 14, desc: `direct message`, nips: [17] },
  { kind: 16, desc: `generic repost`, nips: [18] },
  { kind: 17, desc: `reaction to a website`, nips: [25] },
  { kind: 40, desc: `channel creation`, nips: [28] },
  { kind: 41, desc: `channel metadata`, nips: [28] },
  { kind: 42, desc: `channel message`, nips: [28] },
  { kind: 43, desc: `channel hide message`, nips: [28] },
  { kind: 44, desc: `channel mute user`, nips: [28] },
  { kind: 64, desc: `chess (PGN)`, nips: [64] },
  { kind: 818, desc: `merge requests`, nips: [54] },
  { kind: 1021, desc: `bid`, nips: [15] },
  { kind: 1022, desc: `bid confirmation`, nips: [15] },
  { kind: 1040, desc: `open timestamps`, nips: [3] },
  { kind: 1059, desc: `gift wrap`, nips: [59] },
  { kind: 1063, desc: `file metadata`, nips: [94] },
  { kind: 1311, desc: `live chat message`, nips: [53] },
  { kind: 1617, desc: `patches`, nips: [34] },
  { kind: 1621, desc: `issues`, nips: [34] },
  { kind: 1622, desc: `replies`, nips: [34] },
  { kind: 1630, kindMax: 1633, desc: `status`, nips: [34] },
  { kind: 1971, desc: `problem tracker`, nips: ['nostrocket'] },
  { kind: 1984, desc: `reporting`, nips: [56] },
  { kind: 1985, desc: `label`, nips: [32] },
  { kind: 1986, desc: `relay reviews`, nips: [] },
  { kind: 1987, desc: `AI embeddings / vector lists`, nips: ['NKBIP-02'] },
  { kind: 2003, desc: `torrent`, nips: [35] },
  { kind: 2004, desc: `torrent comment`, nips: [35] },
  { kind: 2022, desc: `coinjoin pool`, nips: ['joinstr'] },
  { kind: 4550, desc: `community post approval`, nips: [72] },
  { kind: 5000, kindMax: 5999, desc: `job request`, nips: [90] },
  { kind: 6000, kindMax: 6999, desc: `job result`, nips: [90] },
  { kind: 7000, desc: `job feedback`, nips: [90] },
  { kind: 9000, kindMax: 9030, desc: `group control events`, nips: [29] },
  { kind: 9041, desc: `zap goal`, nips: [75] },
  { kind: 9467, desc: `tidal login`, nips: ['tidal-nostr'] },
  { kind: 9734, desc: `zap request`, nips: [57] },
  { kind: 9735, desc: `zap`, nips: [57] },
  { kind: 9802, desc: `highlights`, nips: [84] },
  { kind: 10000, desc: `mute list`, nips: [51] },
  { kind: 10001, desc: `pin list`, nips: [51] },
  { kind: 10002, desc: `relay list metadata`, nips: [65] },
  { kind: 10003, desc: `bookmark list`, nips: [51] },
  { kind: 10004, desc: `communities list`, nips: [51] },
  { kind: 10005, desc: `public chats list`, nips: [51] },
  { kind: 10006, desc: `blocked relays list`, nips: [51] },
  { kind: 10007, desc: `search relays list`, nips: [51] },
  { kind: 10009, desc: `user groups`, nips: [51, 29] },
  { kind: 10015, desc: `interests list`, nips: [51] },
  { kind: 10030, desc: `user emoji list`, nips: [51] },
  { kind: 10050, desc: `relay list to receive DMs`, nips: [51, 17] },
  { kind: 10063, desc: `user server list`, nips: ['Blossom'] },
  { kind: 10096, desc: `file storage server list`, nips: [96] },
  { kind: 13194, desc: `wallet info`, nips: [47] },
  { kind: 21000, desc: `lightning pub RPC`, nips: ['Lightning.Pub'] },
  { kind: 22242, desc: `client authentication`, nips: [42] },
  { kind: 23194, desc: `wallet request`, nips: [47] },
  { kind: 23195, desc: `wallet response`, nips: [47] },
  { kind: 24133, desc: `nostr connect`, nips: [46] },
  { kind: 24242, desc: `blobs stored on mediaservers`, nips: ['Blossom'] },
  { kind: 27235, desc: `HTTP auth`, nips: [98] },
  { kind: 30000, desc: `follow sets`, nips: [51] },
  { kind: 30001, desc: `generic lists`, nips: [51] },
  { kind: 30002, desc: `relay sets`, nips: [51] },
  { kind: 30003, desc: `bookmark sets`, nips: [51] },
  { kind: 30004, desc: `curation sets`, nips: [51] },
  { kind: 30005, desc: `video sets`, nips: [51] },
  { kind: 30007, desc: `kind mute sets`, nips: [51] },
  { kind: 30008, desc: `profile badges`, nips: [58] },
  { kind: 30009, desc: `badge definition`, nips: [58] },
  { kind: 30015, desc: `interest sets`, nips: [51] },
  { kind: 30017, desc: `create or update a stall`, nips: [15] },
  { kind: 30018, desc: `create or update a product`, nips: [15] },
  { kind: 30019, desc: `marketplace UI/UX`, nips: [15] },
  { kind: 30020, desc: `product sold as an auction`, nips: [15] },
  { kind: 30023, desc: `long-form content`, nips: [23] },
  { kind: 30024, desc: `draft long-form content`, nips: [23] },
  { kind: 30030, desc: `emoji sets`, nips: [51] },
  { kind: 30040, desc: `modular article header`, nips: ['NKBIP-01'] },
  { kind: 30041, desc: `modular article content`, nips: ['NKBIP-01'] },
  { kind: 30063, desc: `release artifact sets`, nips: [51] },
  { kind: 30078, desc: `application-specific data`, nips: [78] },
  { kind: 30311, desc: `live event`, nips: [53] },
  { kind: 30315, desc: `user statuses`, nips: [38] },
  { kind: 30388, desc: `slide set`, nips: ['Corny Chat'] },
  { kind: 30402, desc: `classified listing`, nips: [99] },
  { kind: 30403, desc: `draft classified listing`, nips: [99] },
  { kind: 30617, desc: `repository announcements`, nips: [34] },
  { kind: 30618, desc: `repository state announcements`, nips: [34] },
  { kind: 30818, desc: `wiki article`, nips: [54] },
  { kind: 30819, desc: `redirects`, nips: [54] },
  { kind: 31234, desc: `generic draft event`, nips: ['Generic Draft Event'] },
  { kind: 31338, desc: `audio track`, nips: [] },
  { kind: 31388, desc: `link set`, nips: ['Corny Chat'] },
  { kind: 31890, desc: `feed`, nips: ['NUD: Custom Feeds'] },
  { kind: 31922, desc: `date-based calendar event`, nips: [52] },
  { kind: 31923, desc: `time-based calendar event`, nips: [52] },
  { kind: 31924, desc: `calendar`, nips: [52] },
  { kind: 31925, desc: `calendar event RSVP`, nips: [52] },
  { kind: 31989, desc: `handler recommendation`, nips: [89] },
  { kind: 31990, desc: `handler information`, nips: [89] },
  { kind: 34235, desc: `video event`, nips: [71] },
  { kind: 34236, desc: `short-form portrait video event`, nips: [71] },
  { kind: 34237, desc: `video view event`, nips: [71] },
  { kind: 34550, desc: `community definition`, nips: [72] },
  { kind: 39000, kindMax: 39009, desc: `group metadata events`, nips: [29] },
]

export function noteDecode(bech32) {
  try {
    const decoded = nip19.decode(bech32)
    if (decoded?.type == 'note') {
      return decoded.data
    }
  } catch(e) {
  }
}

export function hpubDecode(bech32) {
  try {
    const decoded = nip19.decode(bech32)
    if (decoded?.type == 'npub') {
      return decoded.data
    }
    if (decoded?.type == 'nprofile') {
      return decoded.data.pubkey
    }
  } catch(e) {
  }
  if (validKey(bech32)) {
    return bech32.toLowerCase()
  }
}

export function nsecDecode(bech32) {
  try {
    const decoded = nip19.decode(bech32)
    if (decoded?.type == 'nsec') {
      return bytesToHex(decoded.data)
    }
  } catch(e) {
  }
}

export function validKey(hex) {
  return hex?.length === 64 && hex?.toLowerCase().split('').reduce((a, c) => a && '0123456789abcdef'.includes(c), true)
}

export function npub(hpub) {
  return nip19.npubEncode(hpub)
}

export function nsec(hsec) {
  return nip19.nsecEncode(hsec)
}

export function getPubkey(hsec) {
  return getPublicKey(Buffer.from(hsec, 'hex'))
}

export function relayUrl(input) {
  if (input.includes('.')) {
    if (input.includes('://')) {
      return input
    } else {
      return `wss://${input}`
    }
  }
}
