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
  draggable.newPosition = coord.x - draggable.offset.x;
  draggable.onPositionChange(draggable);
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

export function create(placement, relativePosition, relativeSize, fixedBorderSize) {
  let selector = document.createElementNS("http://www.w3.org/2000/svg", 'svg'), 
      bBox = placement.getBBox(),
      x = bBox.width*relativePosition,
      width = bBox.width*relativeSize,
      centerRect, leftRect, rightRect;
  
  selector.setAttributeNS(null, 'viewBox', `${bBox.x} ${bBox.y} ${bBox.width} ${bBox.height}`);
  selector.setAttributeNS(null, 'preserveAspectRatio', 'none');

  selector.setAttributeNS(null, 'x', x);
  selector.setAttributeNS(null, 'width', width);
  selector.setAttributeNS(null, 'style', ['overflow:', 'visible;'].join(''));

  centerRect = createRect('centerRect', 0, 0, '100%', bBox.height, ['opacity:','0.2;']);
  selector.appendChild(centerRect);
  makeDraggable(centerRect, placement, (draggable)=>{
    let {newPosition, previousPosition} = draggable;
    if ( newPosition < 0 ){
      newPosition = 0;
    }
    if ( (newPosition + width) > bBox.width ){
      newPosition = bBox.width - width;
    }
    newPosition = parseFloat(newPosition).toPrecision(4);
    console.log('newPosition, previousPosition', newPosition, previousPosition)
    selector.setAttributeNS(null, "x", newPosition);
  });

  let relativeBorderSize = Number.parseFloat(fixedBorderSize / bBox.width / relativeSize * 100).toPrecision(3);
  leftRect = createRect('leftRect', 0, 0, `${relativeBorderSize}%`, bBox.height, ['opacity:','0.2;'])
  selector.appendChild(leftRect);

  rightRect = createRect('rightRect', `${100 - relativeBorderSize}%`, 0, `${relativeBorderSize}%`, bBox.height, ['opacity:','0.2;'])
  selector.appendChild(rightRect);

  placement.appendChild(selector);
  
  return {
    element: selector
  }
}
