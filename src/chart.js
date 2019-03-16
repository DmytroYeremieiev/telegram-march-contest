
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

function renderPath(chart, line) {
  let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
      d = '',
      x = 0, y = null;
  for (let j = 0; j < line.data.length; j++) {
    const prefix = j === 0 ? 'M' : 'L';
    y = chart._.height - line.data[j] + chart._.minY;
    d += prefix + x +','+ y;
    if (j === line.data.length - 1) {
      // debugger
      console.log('j, line.data[j], x, y', j, line.data[j], x, y)
    }
    x += chart._.gridSize;
  }
  path.setAttribute('d', d);
  path.setAttribute('stroke', line.color);
  path.setAttribute('name', line.name);
  path.setAttribute('fill', 'none');
  chart.svg.appendChild(path);
}

function render(chart) {
  console.log('chart, data', chart);
  Object.keys(chart._.lines).forEach((hash)=>renderPath(chart, chart._.lines[hash]))
}

function prepareData(rawData) {
  const lines = {}, x = {};
  rawData.columns.forEach(column => {
    const hash = column.shift();
    if (rawData.types[hash] !== 'x'){
      lines[hash] = {};
      lines[hash].name = rawData.names[hash];
      lines[hash].color = rawData.colors[hash];
      lines[hash].data = column;
      lines[hash].min = column;
    }else{
      x.data = column;
    }
  });
  return {x, lines}
}

function getElementInnerSize(element) {
  const props = window.getComputedStyle(element);
  return {
    width: element.clientWidth - parseFloat(props.paddingLeft) - parseFloat(props.paddingRight),
    height: element.clientHeight - parseFloat(props.paddingTop) -  parseFloat(props.paddingBottom)
  }
}

function getDimentions(_) {
  const {x, lines, placement} = _;
  let parentElementWidth = getElementInnerSize(placement).width,
      gridSize = Math.ceil(parentElementWidth / (x.data.length - 1)),
      width = gridSize * (x.data.length - 1),
      height = null;
  console.log('parentElementWidth, gridSize, width', parentElementWidth, gridSize, width)
  let totalY = Object.keys(lines).reduce((seed, next)=>{
    return seed.concat(lines[next].data)
  }, []);
  let minY = Math.min.apply(null, totalY), maxY = Math.max.apply(null, totalY);
  height = maxY - minY;
  return {width, height, minY, maxY, gridSize}
}

function create(placement, config, data){
  const chart = {};
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('style', 'border: 1px solid black');
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  chart.svg = svg;
  chart.config = config;
  chart.data = data;
  chart._ = Object.assign({placement: placement}, prepareData(data));
  chart._ = Object.assign(chart._, getDimentions(chart._));
  svg.setAttribute('viewBox', `0 0 ${chart._.width} ${chart._.height}`);
  placement.append(svg);
  return {
    render: _=> render(chart)
  }
}

export default {
  create: create
}