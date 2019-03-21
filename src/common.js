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
  svg.setAttributeNS(null, 'viewBox', `${viewBox.x || 0} ${viewBox.y || 0} ${viewBox.width || 0} ${viewBox.height || 0}`);
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