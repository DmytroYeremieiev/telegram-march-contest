export function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x);
}

export function setViewPort(svg, viewPort) {
  setAttr(svg, 'x', viewPort.x);
  setAttr(svg, 'y', viewPort.y);
  setAttr(svg, 'width', viewPort.width);
  setAttr(svg, 'height', viewPort.height );
  return svg;
}

export function getMousePosition(evt, svg) {
  let CTM = svg.getScreenCTM();
  if (evt.touches) {
    evt = evt.touches[0];
  }
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
}


export function setViewBox(svg, viewBox) {
  let [x,y,width, height] = (svg.getAttributeNS(null, 'viewBox') || "0 0 0 0").split(' ');
  x = viewBox.x != null ? viewBox.x : x;
  y = viewBox.y != null ? viewBox.y : y;
  width = viewBox.width != null ? viewBox.width : width;
  height = viewBox.height != null ? viewBox.height : height;

  setAttr(svg, 'viewBox', `${x} ${y} ${width} ${height}`);
  return svg;
}

export function createSvgElem(elemType = 'svg', id = '', styles = []) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", elemType);
  if(id.length > 0) setAttr(svg, 'id', id);
  if(styles!=null && styles.length > 0) setAttr(svg, 'style', styles.join(''));
  return svg;
}

export function setAttr(svg, name, value) {
  if (value != null) {
    svg.setAttributeNS(null, name, value);
  }
  return svg;
}

export function setAttrs(svg, attrs) {
  attrs.forEach((attr)=>setAttr(svg, attr[0], attr[1]));
  return svg;
}