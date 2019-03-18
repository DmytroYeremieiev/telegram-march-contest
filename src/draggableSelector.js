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

function getXPosition(evt, svg) {
  var CTM = svg.getScreenCTM();
  return (evt.clientX - CTM.e) / CTM.a
}

function startDrag(evt, draggable) {
  console.log('startDrag: ', draggable)
  draggable.selected = true;
  draggable.x_coord = getXPosition(evt, draggable.svg);
  draggable.x = parseFloat(evt.target.parentNode.getAttributeNS(null, "x"));
  draggable.x_offset = draggable.x_coord - draggable.x;
}
function drag(evt, draggable) {
  if(!draggable.selected){
    return;
  }
  evt.preventDefault();
  let x_coord = getXPosition(evt, draggable.svg);
  draggable.newPosition = x_coord - draggable.x_offset;
  draggable.new_x_coord = x_coord;
  draggable.onPositionChange(evt, draggable);
}
function endDrag(evt, draggable) {
  console.log('endDrag: ', draggable)
  draggable.selected = false;
}

function makeDraggable(svg, onPositionChange) {
  let draggable = {
    svg: svg,
    selected: false,
    onPositionChange
  };

  svg.addEventListener('mousedown', evt=> startDrag(evt, draggable), false);
  svg.addEventListener('mousemove', evt=> drag(evt, draggable), false);
  svg.addEventListener('mouseup', evt=> endDrag(evt, draggable), false);
  svg.addEventListener('mouseleave', evt=> endDrag(evt, draggable));
}

export function add(placement, relativePosition, relativeSize, sideSize) {
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
  
  let relativeBorderSize = Number.parseFloat(sideSize / bBox.width / relativeSize * 100).toPrecision(3);
  leftRect = createRect('leftRect', 0, 0, `${relativeBorderSize}%`, bBox.height, ['opacity:','0.2;'])
  selector.appendChild(leftRect);
  
  rightRect = createRect('rightRect', `${100 - relativeBorderSize}%`, 0, `${relativeBorderSize}%`, bBox.height, ['opacity:','0.2;'])
  selector.appendChild(rightRect);
  
  makeDraggable(placement, (evt, draggable)=>{
    // if(!['centerRect', 'leftRect', 'rightRect'].includes(evt.target.id)){
    //   return;
    // }
    let {newPosition} = draggable;
    if ( newPosition < 0 ){
      newPosition = 0;
    }
    if ( (newPosition + width) > bBox.width ){
      newPosition = bBox.width - width;
    }
    newPosition = parseFloat(newPosition).toPrecision(4);
    // setTimeout(_=>selector.setAttributeNS(null, "x", newPosition),0)
    console.log('newX, startX, svgX, offset', draggable.new_x_coord, draggable.x_coord, draggable.x, draggable.x_offset)

    selector.setAttributeNS(null, "x", newPosition);
  });
  placement.appendChild(selector);
  
  return {
    element: selector
  }
}
