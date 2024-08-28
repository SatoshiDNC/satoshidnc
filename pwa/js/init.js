import { appBar } from './appBar.js'
import { roomBar } from './roomBar.js'
import { chatMenuRoot } from './chatMenu.js'
import { chatRoot } from './chat.js'
import { homeRoot } from './home.js'

appBar.menuGad.target = chatMenuRoot
roomBar.menuGad.target = chatMenuRoot
roomBar.backGad.root = chatRoot, roomBar.backGad.target = homeRoot
