function createRect(x, y, width, height, styles) {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
  rect.setAttributeNS(null, 'x', x);
  rect.setAttributeNS(null, 'y', y);
  rect.setAttributeNS(null, 'width', width);
  rect.setAttributeNS(null, 'height', height);
  rect.setAttributeNS(null, 'style', styles.join(''));
  return rect;
}


function startDrag(evt) {
  console.log('startDrag: ', evt.target)
  selectedElement = evt.target;
}
function drag(evt) {
  if(!selectedElement){
    return;
  }
  evt.preventDefault();
  var x = parseFloat(selectedElement.getAttributeNS(null, "x"));
  console.log('drag: ', x + 0.1);
  // selectedElement.setAttributeNS(null, "x", x + 0.1);

}
function endDrag(evt) {
  console.log('endDrag: ', evt.target)
  selectedElement = null;
}

function makeDraggable(elem) {
  let selected = null;



  elem.addEventListener('mousedown', startDrag);
  elem.addEventListener('mousemove', drag);
  elem.addEventListener('mouseup', endDrag);
  elem.addEventListener('mouseleave', endDrag);

}

export function create(placement, x, y, width, height, relativePosition, relativeSize, fixedBorderSize) {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'), 
      centerRect, leftRect, rightRect;

  svg.setAttributeNS(null, 'viewBox', `${x} ${y} ${width} ${height}`);
  svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
  

  svg.setAttributeNS(null, 'x', `${100*relativePosition}%`);
  svg.setAttributeNS(null, 'width', `${100*relativeSize}%`);
  svg.setAttributeNS(null, 'style', ['overflow:', 'visible;'].join(''));

  centerRect = createRect(0, 0, '100%', height, ['opacity:','0.2;'])
  svg.appendChild(centerRect);
  makeDraggable(centerRect);

  let relativeBorderSize = Number.parseFloat(fixedBorderSize / width / relativeSize * 100).toPrecision(3);
  leftRect = createRect(0, 0, `${relativeBorderSize}%`, height, ['opacity:','0.2;'])
  svg.appendChild(leftRect);

  rightRect = createRect(`${100 - relativeBorderSize}%`, 0, `${relativeBorderSize}%`, height, ['opacity:','0.2;'])
  svg.appendChild(rightRect);

  placement.appendChild(svg);
  
  return {
    element: svg
  }
}
