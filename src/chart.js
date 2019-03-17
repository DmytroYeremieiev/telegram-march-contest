import {create as createSelector} from "./rectSelector.js"

let pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

function createLine(canvas, x1, x2, y1, y2) {
  let line = document.createElement('line');
  canvas.setAttribute('x1', x1);
  canvas.setAttribute('x2', x2);
  canvas.setAttribute('y1', y1);
  canvas.setAttribute('y2', y2);
  canvas.setAttribute('stroke', 'black');
  line.appendChild(line);
}

function renderLine(canvas, line, viewBoxHeight, minValue, stepSize) {
  let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
      d = '',
      x = 0, y = null;
  for (let j = 0; j < line.data.length; j++) {
    const prefix = j === 0 ? 'M' : 'L';
    y = viewBoxHeight - line.data[j] + minValue;
    d += prefix + x +','+ y;
    if (j === line.data.length - 1) {
      console.log('j, line.data[j], x, y', j, line.data[j], x, y)
    }
    x += stepSize;
  }
  path.setAttribute('d', d);
  path.setAttribute('stroke', line.color);
  path.setAttribute('name', line.name);
  path.setAttribute('fill', 'none');
  canvas.appendChild(path);
}

function render(_) {
  console.log('_ :', _);
  Object.keys(_.lines).forEach((hash)=>renderLine(_.canvas, _.lines[hash], _.viewBoxHeight, _.minValue , _.x.stepSize));
  createSelector(_.canvas, _.viewBoxWidth, _.viewBoxHeight, _.viewBoxWidth / 5);
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

function setElementInnerSize(_) {
  const props = window.getComputedStyle(_.placement);
  _.canvasWidth = _.placement.clientWidth - parseFloat(props.paddingLeft) - parseFloat(props.paddingRight);
  _.canvasHeight = _.placement.clientHeight - parseFloat(props.paddingTop) -  parseFloat(props.paddingBottom);
  return _
}

function setDimentions(_) {
  const {x} = _;
  _.viewBoxWidth = x.stepSize * (x.steps.length - 1);
  _.viewBoxHeight = _.maxValue - _.minValue;
  return _
}

function create(placement, config, data){
  const chart = {};
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('style', 'border: 1px solid black');
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  chart.config = config;
  chart._ = pipe(
    setElementInnerSize,
    prepareData, 
    setDimentions,
  )({placement: placement, canvas: svg, data: data});
  svg.setAttribute('viewBox', `0 0 ${chart._.viewBoxWidth} ${chart._.viewBoxHeight}`);
  placement.append(svg);
  return {
    render: _=> render(chart._)
  }
}

export default {
  create: create
}