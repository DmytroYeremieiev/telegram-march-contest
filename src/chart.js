import {add as addDraggableSelector} from "./draggableSelector.js"
import {pipe} from "./common.js"

function renderLine(svg, line, viewBoxHeight, y_coefficient, minValue, stepSize) {
  let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
      d = '',
      x = 0, y = null;
  for (let j = 0; j < line.data.length; j++) {
    const prefix = j === 0 ? 'M' : 'L';
    y = viewBoxHeight - (line.data[j] - minValue)*y_coefficient;
    d += prefix + x +','+ y;
    // if (y < 0) {
    //   console.log('j, line.data[j], x, y', j, line.data[j], x, y)
    // }
    x += stepSize;
  }
  path.setAttribute('d', d);
  path.setAttribute('stroke', line.color);
  path.setAttribute('name', line.name);
  path.setAttribute('fill', 'none');
  svg.appendChild(path);
}

function render(_) {
  console.log('_ :', _);
  Object.values(_.lines).forEach((line)=>renderLine(_.viewAllSvg, line, _.viewBoxHeight, _.y_coefficient, _.minValue , _.x.stepSize));
  addDraggableSelector(_.viewAllSvg, 0.5, 0.2, 0.05).onSelected((x, width)=>{
    console.log('onSelected', x, width)
  });
}

function setProportions(_) {
  const {x} = _;
  _.viewBoxWidth = x.stepSize * (x.steps.length - 1);
  _.viewBoxHeight = _.viewBoxWidth / 4;
  _.y_coefficient = _.viewBoxHeight / (_.maxValue - _.minValue);
  return _
}

function prepareData(_) {
  const lines = {}, x = {};
  let totalData = [];
  _.data.columns.forEach(column => {
    const hash = column.shift();
    if (_.data.types[hash] !== 'x'){
      lines[hash] = {};
      lines[hash].name = _.data.names[hash];
      lines[hash].color = _.data.colors[hash];
      lines[hash].data = column;
      totalData = totalData.concat(column);
      lines[hash].min = Math.min.apply(null, column);
      lines[hash].max = Math.max.apply(null, column);
    }else{
      x.steps = column;
      x.stepSize = Math.ceil(_.canvasWidth / (x.steps.length - 1));
    }
  });
  _.lines = lines;
  _.x = x;
  _.minValue = Math.min.apply(null, totalData);
  _.maxValue = Math.max.apply(null, totalData);
  return _
}

function setElementContainerSize(_) {
  const props = window.getComputedStyle(_.placement);
  _.canvasWidth = _.placement.clientWidth - parseFloat(props.paddingLeft) - parseFloat(props.paddingRight);
  // _.canvasHeight = _.placement.clientHeight - parseFloat(props.paddingTop) -  parseFloat(props.paddingBottom);
  return _
}

function create(placement, config, data){
  const chart = {};
  const viewAllSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  viewAllSvg.setAttribute('style', 'border: 1px solid black');
  viewAllSvg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  chart.config = config;
  chart._ = pipe(
    setElementContainerSize,
    prepareData, 
    setProportions,
  )({placement: placement, viewAllSvg: viewAllSvg, data: data});
  viewAllSvg.setAttribute('viewBox', `0 0 ${chart._.viewBoxWidth} ${chart._.viewBoxHeight}`);

  const panViewSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  panViewSvg.setAttribute('viewBox', `0 0 ${chart._.viewBoxWidth} ${chart._.viewBoxWidth}`);

  placement.append(panViewSvg);
  placement.append(viewAllSvg);
  return {
    render: _=> render(chart._)
  }
}

export default {
  create: create
}