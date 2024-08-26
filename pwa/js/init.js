import { roomBar } from './roomBar.js'
import { chatMenuRoot } from './chatMenu.js'
import { chatRoot } from './chat.js'
import { homeRoot } from './home.js'

roomBar.menuGad.target = chatMenuRoot
roomBar.backGad.root = chatRoot, roomBar.backGad.target = homeRoot
