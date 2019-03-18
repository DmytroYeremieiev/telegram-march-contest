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

function getMousePosition(evt, svg) {
  var CTM = svg.getScreenCTM();
  return {
    x: (evt.clientX - CTM.e) / CTM.a
  };
}

function startDrag(evt, draggable) {
  console.log('startDrag: ', draggable)
  draggable.selected = true;
  draggable.offset = getMousePosition(evt, draggable.elem);
  draggable.offset.x -= parseFloat(evt.target.parentNode.getAttributeNS(null, "x"));
}
function drag(evt, draggable) {
  if(!draggable.selected){
    return;
  }
  evt.preventDefault();
  let coord = getMousePosition(evt, draggable.elem);
  draggable.newPosition = coord.x - draggable.offset.x;
  draggable.onPositionChange(evt, draggable);
}
function endDrag(evt, draggable) {
  console.log('endDrag: ', draggable)
  draggable.selected = false;
}

function makeDraggable(svg, onPositionChange) {
  let draggable = {
    elem: svg,
    selected: false,
    onPositionChange
  };

  svg.addEventListener('mousedown', evt=> startDrag(evt, draggable), false);
  svg.addEventListener('mousemove', evt=> drag(evt, draggable), false);
  svg.addEventListener('mouseup', evt=> endDrag(evt, draggable), false);
  svg.addEventListener('mouseleave', evt=> endDrag(evt, draggable));
}

export function add(placement, relativePosition, relativeSize, fixedBorderSize) {
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
  
  makeDraggable(placement, (evt, draggable)=>{
    if(evt.target.id !== 'centerRect'){
      return;
    }
    // console.log('evt.target', evt.target, draggable)
    // return;
    let {newPosition, previousPosition} = draggable;
    // if ( newPosition < 0 ){
    //   newPosition = 0;
    // }
    // if ( (newPosition + width) > bBox.width ){
    //   newPosition = bBox.width - width;
    // }
    newPosition = parseFloat(newPosition).toPrecision(4);
    console.log('newPosition, previousPosition', newPosition, previousPosition)
    selector.setAttributeNS(null, "x", newPosition);
  });

  // let relativeBorderSize = Number.parseFloat(fixedBorderSize / bBox.width / relativeSize * 100).toPrecision(3);
  // leftRect = createRect('leftRect', 0, 0, `${relativeBorderSize}%`, bBox.height, ['opacity:','0.2;'])
  // selector.appendChild(leftRect);

  // rightRect = createRect('rightRect', `${100 - relativeBorderSize}%`, 0, `${relativeBorderSize}%`, bBox.height, ['opacity:','0.2;'])
  // selector.appendChild(rightRect);

  placement.appendChild(selector);
  
  return {
    element: selector
  }
}
