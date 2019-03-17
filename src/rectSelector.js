function createRect(id, x, y, width, height, styles) {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
  rect.setAttributeNS(null, 'id', id);
  rect.setAttributeNS(null, 'x', x);
  rect.setAttributeNS(null, 'y', y);
  rect.setAttributeNS(null, 'width', width);
  rect.setAttributeNS(null, 'height', height);
  rect.setAttributeNS(null, 'style', styles.join(''));
  return rect;
}

function getMousePosition(evt, relativeParent) {
  var CTM = relativeParent.getScreenCTM();
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
}

function startDrag(evt, draggable) {
  console.log('startDrag: ', evt.target, draggable)
  draggable.selected = true;
}
function drag(evt, draggable) {
  if(!draggable.selected){
    return;
  }
  evt.preventDefault();
  let coord = getMousePosition(evt, draggable.relativeParent);

  xOffset.x -= parseFloat(selectedElement.getAttributeNS(null, "x"));
  yOffset.y -= parseFloat(selectedElement.getAttributeNS(null, "y"));

  // var x = parseFloat(draggable.elem.parentNode.getAttributeNS(null, "x"));
  console.log('drag: coord', coord);
  // selectedElement.setAttributeNS(null, "x", x + 0.1);

}
function endDrag(evt, draggable) {
  // console.log('endDrag: ', evt.target, draggable)
  draggable.selected = false;
}

function makeDraggable(elem, relativeParent) {
  let draggable = {
    relativeParent: relativeParent,
    elem: elem,
    selected: false
  };

  elem.addEventListener('mousedown', evt=> startDrag(evt, draggable));
  elem.addEventListener('mousemove', evt=> drag(evt, draggable));
  elem.addEventListener('mouseup', evt=> endDrag(evt, draggable));
  elem.addEventListener('mouseleave', evt=> endDrag(evt, draggable));
}

export function create(placement, x, y, width, height, relativePosition, relativeSize, fixedBorderSize) {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'), 
      centerRect, leftRect, rightRect;

  svg.setAttributeNS(null, 'viewBox', `${x} ${y} ${width} ${height}`);
  svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
  

  svg.setAttributeNS(null, 'x', `${width*relativePosition}`);
  svg.setAttributeNS(null, 'width', `${width*relativeSize}`);
  svg.setAttributeNS(null, 'style', ['overflow:', 'visible;'].join(''));

  centerRect = createRect('centerRect', 0, 0, '100%', height, ['opacity:','0.2;'])
  svg.appendChild(centerRect);
  makeDraggable(centerRect, placement);

  let relativeBorderSize = Number.parseFloat(fixedBorderSize / width / relativeSize * 100).toPrecision(3);
  leftRect = createRect('leftRect', 0, 0, `${relativeBorderSize}%`, height, ['opacity:','0.2;'])
  svg.appendChild(leftRect);

  rightRect = createRect('rightRect', `${100 - relativeBorderSize}%`, 0, `${relativeBorderSize}%`, height, ['opacity:','0.2;'])
  svg.appendChild(rightRect);

  placement.appendChild(svg);
  
  return {
    element: svg
  }
}
