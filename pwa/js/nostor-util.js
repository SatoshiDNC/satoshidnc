import * as nip19 from 'nostr-tools/nip19'
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { Relay } from 'nostr-tools/relay'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { getKeyInfo } from './keys.js'
import { db } from './db.js'

export { nostrWatchRelays } from './sw/nostor.js'

export const kindInfo = [
  { kind: 0, desc: `User Metadata`, nips: [1] },
  { kind: 1, desc: `Short Text Note`, nips: [1] },
  { kind: 2, desc: `Recommend Relay`, nips: [1] }, // deprecated
  { kind: 3, desc: `Follows`, nips: [2] },
  { kind: 4, desc: `Encrypted Direct Messages`, nips: [4] },
  { kind: 5, desc: `Event Deletion Request`, nips: [9] },
  { kind: 6, desc: `Repost`, nips: [18] },
  { kind: 7, desc: `Reaction`, nips: [25] },
  { kind: 8, desc: `Badge Award`, nips: [58] },
  { kind: 9, desc: `Group Chat Message`, nips: [29] },
  { kind: 10, desc: `Group Chat Threaded Reply`, nips: [29] },
  { kind: 11, desc: `Group Thread`, nips: [29] },
  { kind: 12, desc: `Group Thread Reply`, nips: [29] },
  { kind: 13, desc: `Seal`, nips: [59] },
  { kind: 14, desc: `Direct Message`, nips: [17] },
  { kind: 16, desc: `Generic Repost`, nips: [18] },
  { kind: 17, desc: `Reaction to a website`, nips: [25] },
  { kind: 40, desc: `Channel Creation`, nips: [28] },
  { kind: 41, desc: `Channel Metadata`, nips: [28] },
  { kind: 42, desc: `Channel Message`, nips: [28] },
  { kind: 43, desc: `Channel Hide Message`, nips: [28] },
  { kind: 44, desc: `Channel Mute User`, nips: [28] },
  { kind: 64, desc: `Chess (PGN)`, nips: [64] },
  { kind: 818, desc: `Merge Requests`, nips: [54] },
  { kind: 1021, desc: `Bid`, nips: [15] },
  { kind: 1022, desc: `Bid confirmation`, nips: [15] },
  { kind: 1040, desc: `OpenTimestamps`, nips: [3] },
  { kind: 1059, desc: `Gift Wrap`, nips: [59] },
  { kind: 1063, desc: `File Metadata`, nips: [94] },
  { kind: 1311, desc: `Live Chat Message`, nips: [53] },
  { kind: 1617, desc: `Patches`, nips: [34] },
  { kind: 1621, desc: `Issues`, nips: [34] },
  { kind: 1622, desc: `Replies`, nips: [34] },
  { kind: 1630, kindMax: 1633, desc: `Status`, nips: [34] },
  { kind: 1971, desc: `Problem Tracker`, nips: ['nostrocket'] },
  { kind: 1984, desc: `Reporting`, nips: [56] },
  { kind: 1985, desc: `Label`, nips: [32] },
  { kind: 1986, desc: `Relay reviews`, nips: [] },
  { kind: 1987, desc: `AI Embeddings / Vector lists`, nips: ['NKBIP-02'] },
  { kind: 2003, desc: `Torrent`, nips: [35] },
  { kind: 2004, desc: `Torrent Comment`, nips: [35] },
  { kind: 2022, desc: `Coinjoin Pool`, nips: ['joinstr'] },
  { kind: 4550, desc: `Community Post Approval`, nips: [72] },
  { kind: 5000, kindMax: 5999, desc: `Job Request`, nips: [90] },
  { kind: 6000, kindMax: 6999, desc: `Job Result`, nips: [90] },
  { kind: 7000, desc: `Job Feedback`, nips: [90] },
  { kind: 9000, kindMax: 9030, desc: `Group Control Events`, nips: [29] },
  { kind: 9041, desc: `Zap Goal`, nips: [75] },
  { kind: 9467, desc: `Tidal login`, nips: ['Tidal-nostr'] },
  { kind: 9734, desc: `Zap Request`, nips: [57] },
  { kind: 9735, desc: `Zap`, nips: [57] },
  { kind: 9802, desc: `Highlights`, nips: [84] },
  { kind: 10000, desc: `Mute list`, nips: [51] },
  { kind: 10001, desc: `Pin list`, nips: [51] },
  { kind: 10002, desc: `Relay List Metadata`, nips: [65] },
  { kind: 10003, desc: `Bookmark list`, nips: [51] },
  { kind: 10004, desc: `Communities list`, nips: [51] },
  { kind: 10005, desc: `Public chats list`, nips: [51] },
  { kind: 10006, desc: `Blocked relays list`, nips: [51] },
  { kind: 10007, desc: `Search relays list`, nips: [51] },
  { kind: 10009, desc: `User groups`, nips: [51, 29] },
  { kind: 10015, desc: `Interests list`, nips: [51] },
  { kind: 10030, desc: `User emoji list`, nips: [51] },
  { kind: 10050, desc: `Relay list to receive DMs`, nips: [51, 17] },
  { kind: 10063, desc: `User server list`, nips: ['Blossom'] },
  { kind: 10096, desc: `File storage server list`, nips: [96] },
  { kind: 13194, desc: `Wallet Info`, nips: [47] },
  { kind: 21000, desc: `Lightning Pub RPC`, nips: ['Lightning.Pub'] },
  { kind: 22242, desc: `Client Authentication`, nips: [42] },
  { kind: 23194, desc: `Wallet Request`, nips: [47] },
  { kind: 23195, desc: `Wallet Response`, nips: [47] },
  { kind: 24133, desc: `Nostr Connect`, nips: [46] },
  { kind: 24242, desc: `Blobs stored on mediaservers`, nips: ['Blossom'] },
  { kind: 27235, desc: `HTTP Auth`, nips: [98] },
  { kind: 30000, desc: `Follow sets`, nips: [51] },
  { kind: 30001, desc: `Generic lists`, nips: [51] },
  { kind: 30002, desc: `Relay sets`, nips: [51] },
  { kind: 30003, desc: `Bookmark sets`, nips: [51] },
  { kind: 30004, desc: `Curation sets`, nips: [51] },
  { kind: 30005, desc: `Video sets`, nips: [51] },
  { kind: 30007, desc: `Kind mute sets`, nips: [51] },
  { kind: 30008, desc: `Profile Badges`, nips: [58] },
  { kind: 30009, desc: `Badge Definition`, nips: [58] },
  { kind: 30015, desc: `Interest sets`, nips: [51] },
  { kind: 30017, desc: `Create or update a stall`, nips: [15] },
  { kind: 30018, desc: `Create or update a product`, nips: [15] },
  { kind: 30019, desc: `Marketplace UI/UX`, nips: [15] },
  { kind: 30020, desc: `Product sold as an auction`, nips: [15] },
  { kind: 30023, desc: `Long-form Content`, nips: [23] },
  { kind: 30024, desc: `Draft Long-form Content`, nips: [23] },
  { kind: 30030, desc: `Emoji sets`, nips: [51] },
  { kind: 30040, desc: `Modular Article Header`, nips: ['NKBIP-01'] },
  { kind: 30041, desc: `Modular Article Content`, nips: ['NKBIP-01'] },
  { kind: 30063, desc: `Release artifact sets`, nips: [51] },
  { kind: 30078, desc: `Application-specific Data`, nips: [78] },
  { kind: 30311, desc: `Live Event`, nips: [53] },
  { kind: 30315, desc: `User Statuses`, nips: [38] },
  { kind: 30388, desc: `Slide Set`, nips: ['Corny Chat'] },
  { kind: 30402, desc: `Classified Listing`, nips: [99] },
  { kind: 30403, desc: `Draft Classified Listing`, nips: [99] },
  { kind: 30617, desc: `Repository announcements`, nips: [34] },
  { kind: 30618, desc: `Repository state announcements`, nips: [34] },
  { kind: 30818, desc: `Wiki article`, nips: [54] },
  { kind: 30819, desc: `Redirects`, nips: [54] },
  { kind: 31234, desc: `Generic Draft Event`, nips: ['Generic Draft Event'] },
  { kind: 31338, desc: `Audio Track`, nips: [] },
  { kind: 31388, desc: `Link Set`, nips: ['Corny Chat'] },
  { kind: 31890, desc: `Feed`, nips: ['NUD: Custom Feeds'] },
  { kind: 31922, desc: `Date-Based Calendar Event`, nips: [52] },
  { kind: 31923, desc: `Time-Based Calendar Event`, nips: [52] },
  { kind: 31924, desc: `Calendar`, nips: [52] },
  { kind: 31925, desc: `Calendar Event RSVP`, nips: [52] },
  { kind: 31989, desc: `Handler recommendation`, nips: [89] },
  { kind: 31990, desc: `Handler information`, nips: [89] },
  { kind: 34235, desc: `Video Event`, nips: [71] },
  { kind: 34236, desc: `Short-form Portrait Video Event`, nips: [71] },
  { kind: 34237, desc: `Video View Event`, nips: [71] },
  { kind: 34550, desc: `Community Definition`, nips: [72] },
  { kind: 39000, kindMax: 39009, desc: `Group metadata events`, nips: [29] },
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
