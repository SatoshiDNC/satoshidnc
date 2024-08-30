// Helper functions
function rgb(rgba) { return [rgba[0], rgba[1], rgba[2]] }
function alpha(rgba, a) {
	return [rgba[0], rgba[1], rgba[2], Math.min(1, Math.max(0, a))]
}

export const mainShapeBuilder = function() {

	// Shape definitions
	this.addShape2('unitLine', gl.LINE_LOOP, 0,0, 1,1, )
	this.addShape5('unitLine', gl.LINE_LOOP, 0,0,1,1,0, 1,1,0,1,0, )
	this.addShape5('divLine', gl.LINE_STRIP, 0,0,0,0,0, 0.4,0.4,1,1,1, 0.6,0.6,1,1,1, 1,1,0,0,0, )
	this.addShape2('rect', gl.TRIANGLE_STRIP,
		0.0,1, 0.0,0, 1.0,1, 1.0,0, )
	this.addShape4('rect', gl.TRIANGLE_STRIP,
		0.0,1,0,1, 0.0,0,0,0, 1.0,1,1,1, 1.0,0,1,0, )
	this.addShape5('rect', gl.TRIANGLE_STRIP,
		0.0,1,1,1,1, 0.0,0,1,1,1, 1.0,1,1,1,1, 1.0,0,1,1,1, )
  this.addShape2('backarrow', gl.TRIANGLE_STRIP,
    21,0, 24,3, 6,21, 0,21, 21,42, 24,39, 24,39, 2.5,18.5, 2.5,18.5, 42,18.5, 42,23.5, 2.5,23.5, )
  
	{
    const p = []; var n = 50;
    for (var i=0; i<=n; i++) {
      p.push(0.5 + 0.5 * Math.cos(i/n*2*Math.PI));
      p.push(0.5 + 0.5 * Math.sin(i/n*2*Math.PI));
    }
    this.addShape2('circle', gl.TRIANGLE_FAN,
      0.5,0.5, ...p );
	}

	{
    function polarSquare(phi){
      phi = ((phi/Math.PI*180+45)%90-45)/180*Math.PI
      return 1/Math.cos(phi)
    }
    const p = []; var n = 360
    for (var i=0; i<=n; i++) {
      let a = i/n*2*Math.PI
      p.push(0.5 + 0.5 * Math.sin(a)*polarSquare(a))
      p.push(0.5 + 0.5 * Math.cos(a)*polarSquare(a))
      p.push(0.5 + 0.5 * Math.sin(a)*polarSquare(a)*(1/0.9))
      p.push(0.5 + 0.5 * Math.cos(a)*polarSquare(a)*(1/0.9))
    }
    this.addShape2('qrprogress', gl.TRIANGLE_STRIP,
      ...p )
	}

	{
    const p = []; var n = 100;
    for (var i=0; i<n; i++) {
      p.push(0.5);
      p.push(0.5);
      p.push(0.5 + 0.5 * Math.sin(i/n*2*Math.PI));
      p.push(0.5 + 0.5 * Math.cos(i/n*2*Math.PI));
      p.push(0.5 + 0.5 * Math.sin((i+1)/n*2*Math.PI));
      p.push(0.5 + 0.5 * Math.cos((i+1)/n*2*Math.PI));
    }
    this.addShape2('pies', gl.TRIANGLES,
      ...p );
	}

	{
    const s = 0.1, t = 0.02;
    this.addShape2('scanbox', gl.TRIANGLES,
      0+0,0+0, 0+s,0+t, 0+t,0+t, 0+0,0+0, 0+s,0+0, 0+s,0+t, // top-
      0+t,0+t, 0+t,0+s, 0+0,0+s, 0+0,0+0, 0+t,0+t, 0+0,0+s, //  left
      1-0,0+0, 1-s,0+t, 1-t,0+t, 1-0,0+0, 1-s,0+0, 1-s,0+t, // top-
      1-t,0+t, 1-t,0+s, 1-0,0+s, 1-0,0+0, 1-t,0+t, 1-0,0+s, //  right
      1-0,1-0, 1-s,1-t, 1-t,1-t, 1-0,1-0, 1-s,1-0, 1-s,1-t, // bottom-
      1-t,1-t, 1-t,1-s, 1-0,1-s, 1-0,1-0, 1-t,1-t, 1-0,1-s, //  right
      0+0,1-0, 0+s,1-t, 0+t,1-t, 0+0,1-0, 0+s,1-0, 0+s,1-t, // bottom-
      0+t,1-t, 0+t,1-s, 0+0,1-s, 0+0,1-0, 0+t,1-t, 0+0,1-s, //  left
    );
	}

	this.addShape5('scrollUp', gl.TRIANGLE_FAN,
		0.5,0,0.75,0.75,0.75,
		0.0,1,0.25,0.25,0.25,
		0.4,1,1,1,1, 0.6,1,1,1,1,
		1.0,1,0.25,0.25,0.25, );
	this.addShape5('scrollDn', gl.TRIANGLE_FAN,
		0.5,0,0.75,0.75,0.75,
		0.0,1,0.25,0.25,0.25,
		0.4,1,1,1,1, 0.6,1,1,1,1,
		1.0,1,0.25,0.25,0.25, );
	var r = 0.2, w = 0.8, b = 0.3;
	this.addShape5('hamburger', gl.TRIANGLES,
		0,0.0,1,r,r, 1,0.0,1,r,r, 0,0.2,1,r,r, 0,0.2,1,r,r, 1,0.0,1,r,r, 1,0.2,1,r,r,
		0,0.4,w,w,w, 1,0.4,w,w,w, 0,0.6,w,w,w, 0,0.6,w,w,w, 1,0.4,w,w,w, 1,0.6,w,w,w,
		0,0.8,b,b,1, 1,0.8,b,b,1, 0,1.0,b,b,1, 0,1.0,b,b,1, 1,0.8,b,b,1, 1,1.0,b,b,1,
	);
	this.addShape2('maximizer', gl.TRIANGLES,
		0,1, 0,0.6, 0.4,1,
		1,0, 1,0.4, 0.6,0,
		1,0.1, 0.1,1, 0,0.9,
		0,0.9, 0.9,0, 1,0.1,
	);

  {
		var sl = [.7, .8, .9]
		var sc = [.5, .6, .7]
		var w = 22.5, h = 3, x = w-1, y = h-1;
		this.addShape5('speech1o', gl.TRIANGLE_STRIP,
			0,y,...sl, 1,y,...sc, 0,1,...sl, 1,1,...sc, // left
			0.03,0.8,...sl, 1,1,...sc, 0.1,0.6,...sl, 1,1,...sc, 0.2,0.4,...sl, 1,1,...sc,
			0.4,0.2,...sl, 1,1,...sc, 0.6,0.1,...sl, 1,1,...sc, 0.8,0.03,...sl, 1,1,...sc,
			1,0,...sl, x,1,...sc, x,0,...sl, // top
			x,1,...sc, w-0.8,0.03,...sl, x,1,...sc, w-0.6,0.1,...sl, x,1,...sc, w-0.4,0.2,...sl,
			w-0.2,0.4,...sl, x,1,...sc, w-0.1,0.6,...sl, x,1,...sc, w-0.03,0.8,...sl, x,1,...sc,
			w,1,...sl, x,y,...sc, w,y,...sl, // right
			x,y,...sc, w-0.03,h-0.8,...sl, x,y,...sc, w-0.1,h-0.6,...sl, x,y,...sc, w-0.2,h-0.4,...sl, x,y,...sc,
			w-0.4,h-0.2,...sl, x,y,...sc, w-0.6,h-0.1,...sl, x,y,...sc, w-0.8,h-0.03,...sl, x,y,...sc,
			x,h,...sl, 1,y,...sc, 1,h,...sl, 1,y,...sc, // bottom
			0.8,h-0.03,...sl, 1,y,...sc, 0.6,h-0.1,...sl, 1,y,...sc, 0.4,h-0.2,...sl,
			0.2,h-0.4,...sl, 1,y,...sc, 0.1,h-0.6,...sl, 1,y,...sc, 0.03,h-0.8,...sl, 1,y,...sc,
			0,y,...sl,
		);
		this.addShape5('speech1i', gl.TRIANGLE_STRIP,
			1,1,...sc, x,1,...sc, 1,y,...sc, x,y,...sc,
		);
		this.addShape5('speech1j', gl.TRIANGLE_STRIP,
			w,h-1.75,...sl, w+1,h-1.25,...sl, w,h-1,...sl,
		);
	}

	{
		var sl = [.7, .8, .9]
		var sc = [.7, .8, .9]
		var w = 16, h = 1, x = w-1, y = h-1;
		this.addShape2('settingstop', gl.TRIANGLE_STRIP,
			0,h, 1,h, 0,1, 1,1, // left
			0.03,0.8, 1,1, 0.1,0.6, 1,1, 0.2,0.4, 1,1,
			0.4,0.2, 1,1, 0.6,0.1, 1,1, 0.8,0.03, 1,1,
			1,0, x,1, x,0, // top
			x,1, w-0.8,0.03, x,1, w-0.6,0.1, x,1, w-0.4,0.2,
			w-0.2,0.4, x,1, w-0.1,0.6, x,1, w-0.03,0.8, x,1,
			w,1, x,h, w,h, // right
			x,h, x,h, x,1, 1,h, 1,1, // fill
		);
		this.addShape2('settingsbot', gl.TRIANGLE_STRIP,
			x,0, w,0, x,y, w,y, // right
			x,y, w-0.03,h-0.8, x,y, w-0.1,h-0.6, x,y, w-0.2,h-0.4, x,y,
			w-0.4,h-0.2, x,y, w-0.6,h-0.1, x,y, w-0.8,h-0.03, x,y,
			x,h, 1,y, 1,h, 1,y, // bottom
			0.8,h-0.03, 1,y, 0.6,h-0.1, 1,y, 0.4,h-0.2,
			0.2,h-0.4, 1,y, 0.1,h-0.6, 1,y, 0.03,h-0.8, 1,y,
			0,y, 1,y, 0,0, 1,0, // left
			1,0, x,0, 1,h, x,h, // fill
		);
	}

	{
		function addShape2_roundedRect(obj, name, type, w, h) {
			var x = w-1, y = h-1;
			obj.addShape2(name, type,
				0      /w,y       /h, 1       /w,y      /h, 0      /w,1      /h, 1      /w,1      /h, // left
				0.03   /w,0.8     /h, 1       /w,1      /h, 0.1    /w,0.6    /h, 1      /w,1      /h, 0.2     /w,0.4     /h, 1      /w,1      /h,
				0.4    /w,0.2     /h, 1       /w,1      /h, 0.6    /w,0.1    /h, 1      /w,1      /h, 0.8     /w,0.03    /h, 1      /w,1      /h,
				1      /w,0       /h, x       /w,1      /h, x      /w,0      /h, // top
				x      /w,1       /h, (w-0.8) /w,0.03   /h, x      /w,1      /h, (w-0.6)/w,0.1    /h, x       /w,1       /h, (w-0.4)/w,0.2    /h,
				(w-0.2)/w,0.4     /h, x       /w,1      /h, (w-0.1)/w,0.6    /h, x      /w,1      /h, (w-0.03)/w,0.8     /h, x      /w,1      /h,
				w      /w,1       /h, x       /w,y      /h, w      /w,y      /h, // right
				x      /w,y       /h, (w-0.03)/w,(h-0.8)/h, x      /w,y      /h, (w-0.1)/w,(h-0.6)/h, x       /w,y       /h, (w-0.2)/w,(h-0.4)/h, x/w,y/h,
				(w-0.4)/w,(h-0.2) /h, x       /w,y      /h, (w-0.6)/w,(h-0.1)/h, x      /w,y      /h, (w-0.8) /w,(h-0.03)/h, x      /w,y      /h,
				x      /w,h       /h, 1       /w,y      /h, 1      /w,h      /h, 1      /w,y      /h, // bottom
				0.8    /w,(h-0.03)/h, 1       /w,y      /h, 0.6    /w,(h-0.1)/h, 1      /w,y      /h, 0.4     /w,(h-0.2) /h,
				0.2    /w,(h-0.4 )/h, 1       /w,y      /h, 0.1    /w,(h-0.6)/h, 1      /w,y      /h, 0.03    /w,(h-0.8) /h, 1      /w,y      /h,
				0      /w,y       /h, 1       /w,y      /h, 1      /w,y      /h,
				1      /w,1       /h, x       /w,y      /h, x      /w,1      /h,
			);
		}
		addShape2_roundedRect(this, 'keypad', gl.TRIANGLE_STRIP, 4, 4);
		addShape2_roundedRect(this, 'keypadwide', gl.TRIANGLE_STRIP, 8, 4);
		addShape2_roundedRect(this, 'keypadtall', gl.TRIANGLE_STRIP, 4, 8);
	}

	{
		const n = 50;
		var r = n-1, s = 1/r, t = s/2, h = s*Math.sqrt(3)/2;
		const v = [];
		for (var i=0; i<n; i++) {
			v.push(i/r-t,0, i/r+t,0, i/r,h);
		}
		this.addShape2('tear', gl.TRIANGLES, ...v);
	}

}

