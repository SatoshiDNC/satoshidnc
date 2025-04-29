import { barTop } from './bar-top.js'
import { barBot } from './bar-bot.js'
import { contentView } from './content.js'
import { setEasingParameters } from '../util.js'

export const chatRoomRoot = v = new fg.DualSliceView(null, 'v', 147, 147)
v.name = Object.keys({chatRoomRoot}).pop()
v.designSize = 1080 * 2183
v.bgColor = [0,0,0,1]
v.a = barTop; barTop.parent = v
v.b = contentView; contentView.parent = v
v.c = barBot; barBot.parent = v
v.setContext = function(hpub) {
  console.log('chatRoomRoot.setContext')
  v.a?.setContext?.(hpub)
  v.b?.setContext?.(hpub)
  v.c?.setContext?.(hpub)
}
setEasingParameters(v)
