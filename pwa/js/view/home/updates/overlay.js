let v, g
export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.gadgets.push(g = v.cameraGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.buttonFaceColor = colors.accentButtonFace
  g.buttonTextColor = colors.accentButtonText
  g.label = 'c'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.pencilGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.buttonFaceColor = colors.subtleButtonFace
  g.buttonTextColor = colors.subtleButtonText
  g.label = '\x0f'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.cameraGad
  g.x = v.sw-189, g.y = v.sh-189
  g.w = 147, g.h = 147
  g.autoHull()
  g = v.pencilGad
  g.x = v.cameraGad.x+21, g.y = v.cameraGad.y-157
  g.w = 105, g.h = 105
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()

  for (const g of v.gadgets) {
    mat4.identity(m)
    mat4.translate(m,m, [g.x, g.y + g.h, 0])
    mat4.scale(m,m, [g.w/6, g.h/6, 1])
    iconFont.draw(0,0, `\x0a`, g.buttonFaceColor, v.mat, m)
    mat4.identity(m)
    mat4.translate(m,m, [g.x + 49, g.y + 95, 0])
    mat4.scale(m,m, [51/11, 51/11, 1])
    iconFont.draw(-2,0, g.label, g.buttonTextColor, v.mat, m)
  }
}
