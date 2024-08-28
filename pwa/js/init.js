import { appBar } from './appBar.js'
import { roomBar } from './roomBar.js'
import { menuRoot } from './menu.js'
import { chatRoot } from './chat.js'
import { homeRoot } from './home.js'
import { homeOverlayView } from './home.js'
import { newChatRoot } from './view/new-chat/content.js'
import { barTop } from './view/new-chat/bar-top.js'

appBar.menuGad.target = menuRoot
roomBar.menuGad.target = menuRoot
roomBar.backGad.root = chatRoot, roomBar.backGad.target = homeRoot
homeOverlayView.addGad.root = homeRoot, homeOverlayView.addGad.target = newChatRoot
barTop.backGad.root = newChatRoot, barTop.backGad.target = homeRoot
