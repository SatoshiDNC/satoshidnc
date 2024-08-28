import { appBar } from './appBar.js'
import { roomBar } from './roomBar.js'
import { menuRoot } from './menu.js'
import { chatRoot } from './chat.js'
import { homeRoot } from './home.js'

appBar.menuGad.target = menuRoot
roomBar.menuGad.target = menuRoot
roomBar.backGad.root = chatRoot, roomBar.backGad.target = homeRoot
