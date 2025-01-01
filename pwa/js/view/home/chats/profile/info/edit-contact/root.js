import { barTop } from './bar-top.js'
import { barBot } from './bar-bot.js'
import { contentView } from './content.js'
import { setEasingParameters } from '../../../../../util.js'

export const editContactRoot = v = new fg.DualSliceView(null, 'v', 147, 211)
v.name = Object.keys({editContactRoot}).pop()
v.designSize = 1080 * 2183
v.bgColor = [0,0,0,1]
v.a = barTop; barTop.parent = v
v.b = contentView; contentView.parent = v
v.c = barBot; barBot.parent = v
v.setContact = function(hpub) {
  const v = this
  v.a.setContact?.(hpub)
  v.b.setContact?.(hpub)
  v.c.setContact?.(hpub)
}
setEasingParameters(v)