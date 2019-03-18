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
    x: (evt.clientX - CTM.e) / CTM.a
  };
}

function startDrag(evt, draggable) {
  console.log('startDrag: ', draggable)
  draggable.selected = true;
  draggable.offset = getMousePosition(evt, draggable.relativeParent);
  draggable.offset.x -= parseFloat(draggable.elem.getAttributeNS(null, "x"));
}
function drag(evt, draggable) {
  if(!draggable.selected){
    return;
  }
  let coord = getMousePosition(evt, draggable.relativeParent);
  let newPosition = coord.x - draggable.offset.x;
  draggable.onPositionChange(newPosition);
}
function endDrag(evt, draggable) {
  console.log('endDrag: ', draggable)
  draggable.selected = false;
}

function makeDraggable(elem, relativeParent, onPositionChange) {
  let draggable = {
    relativeParent: relativeParent,
    elem: elem.parentNode,
    selected: false,
    onPositionChange
  };

  elem.addEventListener('mousedown', evt=> startDrag(evt, draggable));
  elem.addEventListener('mousemove', evt=> drag(evt, draggable));
  elem.addEventListener('mouseup', evt=> endDrag(evt, draggable));
  elem.addEventListener('mouseleave', evt=> endDrag(evt, draggable));
}

export function create(placement, x, y, width, height, relativePosition, relativeSize, fixedBorderSize) {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'), 
      selectorWidth = width*relativeSize,
      centerRect, leftRect, rightRect;
  
  svg.setAttributeNS(null, 'viewBox', `${x} ${y} ${width} ${height}`);
  svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
  

  svg.setAttributeNS(null, 'x', `${width*relativePosition}`);
  svg.setAttributeNS(null, 'width', `${selectorWidth}`);
  svg.setAttributeNS(null, 'style', ['overflow:', 'visible;'].join(''));

  centerRect = createRect('centerRect', 0, 0, '100%', height, ['opacity:','0.2;']);
  svg.appendChild(centerRect);
  makeDraggable(centerRect, placement, (newPosition)=>{
    if ( newPosition < 0 ){
      newPosition = 0;
    }
    if ( (newPosition + selectorWidth) > width ){
      newPosition = width - selectorWidth;
    }
    newPosition = parseFloat(newPosition).toPrecision(4);
    // console.log('centerRect:drag: coord.x - draggable.offset.x', coord.x, '-',draggable.offset.x,' = ', newPosition)
    svg.setAttributeNS(null, "x", newPosition);
  });

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
