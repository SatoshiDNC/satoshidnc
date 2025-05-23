import { barTop } from './bar-top.js'
import { barBot } from './bar-bot.js'
import { contentView } from './content.js'
import { setEasingParameters } from '../../../util.js'

export const rootView = v = new fg.DualSliceView(null, 'v', 147, 211)
v.name = 'updates create-channel root'
v.designSize = 1080 * 2183
v.bgColor = [0,0,0,1]
v.a = barTop; barTop.parent = v
v.b = contentView; contentView.parent = v
v.c = barBot; barBot.parent = v
setEasingParameters(v)
