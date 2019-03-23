import {pipe, createSvgElem, setViewBox, setViewPort, setAttr} from "./common.js"

function getSideRailSize(relativeSideRailSize, relativeSelectorSize) {
  return +parseFloat(relativeSideRailSize*100 / relativeSelectorSize).toPrecision(3);
}

function getXPosition(evt, svg) {
  var CTM = svg.getScreenCTM();
  return (evt.clientX - CTM.e) / CTM.a
}

function startDrag(evt, draggable) {
  // console.log('startDrag', draggable);
  draggable.selected = evt.target.id;
  draggable.x = getXPosition(evt, draggable.svg);
  draggable.el_x = parseFloat(evt.target.parentNode.getAttributeNS(null, 'x'));
  draggable.new_el_width = draggable.el_width = parseFloat(evt.target.parentNode.getAttributeNS(null, 'width'));
  draggable.x0_offset = draggable.x - draggable.el_x;
  // draggable.x1_offset = draggable.el_x + draggable.el_width - draggable.x;
}
function drag(evt, draggable) {
  if(!draggable.selected || isNaN(draggable.x0_offset)){
    return;
  }
  evt.preventDefault();
  draggable.new_x = getXPosition(evt, draggable.svg);
  draggable.new_el_x = draggable.new_x - draggable.x0_offset;
  draggable.onDrag(evt, draggable);
}
function endDrag(evt, draggable) {
  // console.log('endDrag', draggable);
  draggable.selected = false;
  draggable.onDragEnd(evt, draggable);
}

function makeDraggable(svg, onDrag, onDragEnd) {
  let draggable = {
    svg: svg,
    selected: false,
    onDrag, onDragEnd
  };
  svg.addEventListener('mousedown', evt=> startDrag(evt, draggable), false);
  svg.addEventListener('mousemove', evt=> drag(evt, draggable), false);
  svg.addEventListener('mouseup', evt=> endDrag(evt, draggable), false);
  svg.addEventListener('mouseleave', evt=> endDrag(evt, draggable));
}

export function add(placement, relativePosition, selectorWidth, relativeSideRailSize) {
  let selector = null,
      bBox = placement.getBBox(),
      x = bBox.width*relativePosition,
      width = selectorWidth,
      relativeSelectorWidth = selectorWidth / bBox.width,
      sideRailSize = getSideRailSize(relativeSideRailSize, relativeSelectorWidth),
      centerRect, leftRect, rightRect, 
      styles = ['opacity:','0.2;'],
      onDrag, onDragEnd;

  selector = pipe(
    _=> setViewPort(_, {x, width}),
    _=> setViewBox(_, bBox),
    _=> setAttr(_, 'preserveAspectRatio', 'none')
  )(createSvgElem('svg', 'selector', ['overflow:', 'visible;']));

  centerRect = pipe(
    _=> setViewPort(_, {x: 0, y: 0, width: '100%', height: bBox.height}),
    _=> selector.appendChild(_)
  )(createSvgElem('rect', 'centerRect', styles));
  leftRect = pipe(
    _=> setViewPort(_, {x: 0, y: 0, width: `${sideRailSize}%`, height: bBox.height}),
    _=> selector.appendChild(_)
  )(createSvgElem('rect', 'leftRect', styles));
  rightRect = pipe(
    _=> setViewPort(_, {x: `${100 - sideRailSize}%`, y: 0, width: `${sideRailSize}%`, height: bBox.height}),
    _=> selector.appendChild(_)
  )(createSvgElem('rect', 'rightRect', styles));

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
    setAttr(selector, 'x', new_el_x);
    setAttr(selector, 'width', new_el_width);
    sideRailSize = getSideRailSize(relativeSideRailSize, new_el_width/bBox.width);
    setViewPort(leftRect, {x: 0, y: 0, width: `${sideRailSize}%`, height: bBox.height});
    setViewPort(rightRect, {x: `${100 - sideRailSize}%`, y: 0, width: `${sideRailSize}%`, height: bBox.height});
    if (onDrag) onDrag(new_el_x, new_el_width);
  }, 
  (evt, draggable)=>{
    if (onDrag) onDragEnd(draggable.new_el_x, draggable.new_el_width);
  });
  placement.appendChild(selector);
  
  return {
    element: selector,
    onDrag: function(fn) {
      onDrag = fn;
      return this;
    },
    onDragEnd: function(fn) {
      onDragEnd = fn;
      return this;
    }
  }
}
