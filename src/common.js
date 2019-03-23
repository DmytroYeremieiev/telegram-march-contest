export function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x);
}

export function setViewPort(svg, viewPort) {
  if (viewPort.x != null){
    svg.setAttributeNS(null, 'x', viewPort.x);
  }
  if (viewPort.y != null){
    svg.setAttributeNS(null, 'y', viewPort.y);
  }
  if (viewPort.width != null){
    svg.setAttributeNS(null, 'width', viewPort.width);
  }
  if (viewPort.height != null) {
    svg.setAttributeNS(null, 'height', viewPort.height );
  }
  return svg;
}

export function setViewBox(svg, viewBox) {
  let [x,y,width, height] = (svg.getAttributeNS(null, 'viewBox') || "0 0 0 0").split(' ');
  x = viewBox.x != null ? viewBox.x : x;
  y = viewBox.y != null ? viewBox.y : y;
  width = viewBox.width != null ? viewBox.width : width;
  height = viewBox.height != null ? viewBox.height : height;

  svg.setAttributeNS(null, 'viewBox', `${x} ${y} ${width} ${height}`);
  return svg;
}

export function createSvgElem(elemType = 'svg', id = '', styles = []) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", elemType);
  svg.setAttribute('id', id);
  svg.setAttribute('style', styles.join(''));
  return svg;
}

export function setAttr(svg, name, value) {
  svg.setAttributeNS(null, name, value);
  return svg;
}

export function setAttrs(svg, attrs) {
  attrs.forEach((attr)=>setAttr(svg, attr[0], attr[1]));
  return svg;
}