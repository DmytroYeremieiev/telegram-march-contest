function createRect(id, styles) {
  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttributeNS(null, 'id', id);
  rect.setAttributeNS(null, 'style', styles.join(''));
  return {
    setRectDimentions: function(...params){
      setRectDimentions(rect, ...params);
      return this;
    },
    appendTo: function (svg) {
      svg.appendChild(rect);
      return this;
    }
  };
}

function setRectDimentions(rect, x, y, width, height) {
  rect.setAttributeNS(null, 'x', x);
  rect.setAttributeNS(null, 'y', y);
  rect.setAttributeNS(null, 'width', width);
  rect.setAttributeNS(null, 'height', height);
  return rect;
}

function getSideRailSize(relativeSideRailSize, relativeSelectorSize) {
  return +parseFloat(relativeSideRailSize*100 / relativeSelectorSize).toPrecision(3);
}

function getXPosition(evt, svg) {
  var CTM = svg.getScreenCTM();
  return (evt.clientX - CTM.e) / CTM.a
}

function startDrag(evt, draggable) {
  // console.log('startDrag: ', draggable);
  draggable.selected = evt.target.id;
  draggable.x = getXPosition(evt, draggable.svg);
  draggable.el_x = parseFloat(evt.target.parentNode.getAttributeNS(null, 'x'));
  draggable.new_el_width = draggable.el_width = parseFloat(evt.target.parentNode.getAttributeNS(null, 'width'));
  draggable.x0_offset = draggable.x - draggable.el_x;
  // draggable.x1_offset = draggable.el_x + draggable.el_width - draggable.x;
}
function drag(evt, draggable) {
  if(!draggable.selected){
    return;
  }
  evt.preventDefault();
  draggable.new_x = getXPosition(evt, draggable.svg);
  draggable.new_el_x = draggable.new_x - draggable.x0_offset;
  draggable.onPositionChange(evt, draggable);
}
function endDrag(evt, draggable) {
  // console.log('endDrag: ', draggable);
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

export function add(placement, relativePosition, relativeSelectorSize, relativeSideRailSize) {
  let selector = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      bBox = placement.getBBox(),
      x = bBox.width*relativePosition,
      width = bBox.width*relativeSelectorSize,
      sideRailSize = getSideRailSize(relativeSideRailSize, relativeSelectorSize),
      centerRect, leftRect, rightRect, 
      onSelected;

  selector.setAttributeNS(null, 'viewBox', `${bBox.x} ${bBox.y} ${bBox.width} ${bBox.height}`);
  selector.setAttributeNS(null, 'preserveAspectRatio', 'none');

  selector.setAttributeNS(null, 'x', x);
  selector.setAttributeNS(null, 'width', width);
  selector.setAttributeNS(null, 'style', ['overflow:', 'visible;'].join(''));

  centerRect = createRect('centerRect', ['opacity:','0.2;']).setRectDimentions(0, 0, '100%', bBox.height).appendTo(selector);
  leftRect = createRect('leftRect', ['opacity:','0.2;']).setRectDimentions(0, 0, `${sideRailSize}%`, bBox.height).appendTo(selector);
  rightRect = createRect('rightRect', ['opacity:','0.2;']).setRectDimentions(`${100 - sideRailSize}%`, 0, `${sideRailSize}%`, bBox.height).appendTo(selector);
  
  makeDraggable(placement, (evt, draggable)=>{
    let {selected, x, new_x, el_x, new_el_x, el_width, new_el_width} = draggable, 
        sideRailSize;
    new_el_x = +parseFloat(new_el_x).toPrecision(6);
    
    function log() {
      console.log(
      `selected - '${selected}', \n` +
      // `x: ${x}, new_x: ${new_x}, \n` +
      // `x0_offset: ${x0_offset}, x1_offset: ${x1_offset} \n ` +
      `el_x: ${el_x}, new_el_x: ${new_el_x} \n` +
      `el_width: ${el_width}, new_el_width: ${new_el_width}`
      );
    }
    // log();
    if(selected === 'leftRect'){
      new_el_width = el_width + el_x - new_el_x;
      if(new_el_x < 0){
        new_el_x = 0;
        new_el_width = el_width + el_x;
      }
      if(new_el_width < width){
        new_el_x -= width - new_el_width;
        new_el_width = width;
      }
    }else if(selected === 'rightRect'){
      new_el_width = el_width + new_x - x;
      new_el_x = el_x;
      if(new_el_width < width){
        new_el_width = width;
      }
      if( el_x + new_el_width > bBox.width ){
        new_el_width = bBox.width - el_x;
      }
    }else{
      if ( new_el_x < 0 ){
        new_el_x = 0;
      }
      if ( new_el_x + new_el_width > bBox.width ){
        new_el_x = bBox.width - new_el_width;
      }
    }
    selector.setAttributeNS(null, 'x', new_el_x);
    selector.setAttributeNS(null, 'width', new_el_width);

    sideRailSize = getSideRailSize(relativeSideRailSize, new_el_width/bBox.width);
    leftRect.setRectDimentions(0, 0, `${sideRailSize}%`, bBox.height);
    rightRect.setRectDimentions(`${100 - sideRailSize}%`, 0, `${sideRailSize}%`, bBox.height);
    if (onSelected){
      onSelected(new_el_x, new_el_width);
    }
  });
  placement.appendChild(selector);
  
  return {
    element: selector,
    onSelected: (fn)=> onSelected = fn
  }
}
