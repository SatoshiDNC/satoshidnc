import { barTop } from './bar-top.js'
import { contentView } from './content.js'
import { setEasingParameters } from '../../../util.js'

export const newChatRoot = v = new fg.DualSliceView(null, 'v', 147, 0)
v.name = Object.keys({newChatRoot}).pop()
v.designSize = 1080 * 2183
v.bgColor = [0,0,0,1]
v.a = barTop; barTop.parent = v
v.b = contentView; contentView.parent = v
setEasingParameters(v)
