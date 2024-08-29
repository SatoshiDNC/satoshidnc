let v, g
export const barTop = v = new fg.View()
v.name = Object.keys({barTop}).pop()
v.designHeight = 147
v.bgColor = [0.043,0.078,0.106,1]
v.textColor = [1,1,1,1]
v.gadgets.push(g = v.backGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x08'
  g.x = 43, g.y = 52
  g.w = 42, g.h = 42
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.lawGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '='
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
v.layoutFunc = function() {
  const v = this
  g = v.lawGad
  g.x = v.sw - 322
  g.y = 51
  g.w = 45
  g.h = 45
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const mat = mat4.create()
  mat4.identity(mat)
  mat4.translate(mat, mat, [141, 98, 0])
  mat4.scale(mat, mat, [46/14, 46/14, 1])
  defaultFont.draw(0,0, 'New contact', v.textColor, v.mat, mat)

  for (g of v.gadgets) {
    mat4.identity(mat)
    mat4.translate(mat, mat, [g.x, g.y+g.h, 0])
    mat4.scale(mat, mat, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, mat)
  }
}

