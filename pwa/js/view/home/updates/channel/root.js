import { barTop } from './bar-top.js'
import { barBot } from './bar-bot.js'
import { contentView } from './content.js'
import { setEasingParameters } from '../../../util.js'

export const rootView = v = new fg.DualSliceView(null, 'v', 147, 147)
v.name = Object.keys({rootView}).pop()
v.designSize = 1080 * 2183
v.ghostOpacity = 0 // needed?
v.bgColor = colors.black
v.a = barTop; barTop.parent = v
v.b = contentView; contentView.parent = v
v.c = barBot; barBot.parent = v
v.setContext = function(updates, hpub, returnView) {
  contentView.setContext(updates, hpub, returnView)
}
setEasingParameters(v)
