import { barTop as homeChatTop } from './view/home-chat/bar-top.js'
import { barTop as newChatTop } from './view/new-chat/bar-top.js'
import { roomBar } from './roomBar.js'
import { menuRoot } from './menu.js'
import { chatRoot } from './chat.js'
import { homeRoot } from './view/home-chat/content.js'
import { homeOverlayView } from './view/home-chat/content.js'
import { newChatRoot } from './view/new-chat/content.js'

homeChatTop.menuGad.target = menuRoot
roomBar.menuGad.target = menuRoot
roomBar.backGad.root = chatRoot, roomBar.backGad.target = homeRoot
homeOverlayView.addGad.root = homeRoot, homeOverlayView.addGad.target = newChatRoot
newChatTop.backGad.root = newChatRoot, newChatTop.backGad.target = homeRoot
