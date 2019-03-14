

function createLine(canvas, x1, x2, y1, y2) {
  let line = document.createElement('line');
  canvas.setAttribute('x1', x1);
  canvas.setAttribute('x2', x2);
  canvas.setAttribute('y1', y1);
  canvas.setAttribute('y2', y2);
  canvas.setAttribute('stroke', 'black');
  line.appendChild(line);
}

function cookData(chart, data) {
  chart._data = [];
  for (let index = 0; index < data.length; index++) {
    const t = {};
    t.x = chart.config.xAxisValueMapper(data[index]);
    t.y = chart.config.yAxisValueMapper(data[index]);
    chart._data.push(t);
  }
}

function renderPath(chart, data) {
  for (let i = 0; i < data.columns.length; i++) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    let column = data.columns[i],
        columnHashName = column[0],
        d = '',
        x = 0;
    if(data.types[columnHashName] === 'x'){
      continue
    }
    for (let j = 1; j < column.length; j++) {
      const prefix = j === 1 ? 'M' : 'L';
      d += prefix + x +','+ (chart.config.height - column[j]);
      x += chart.config.gridSize;
    }
    path.setAttribute('d', d);
    path.setAttribute('stroke', data.colors[columnHashName]);
    path.setAttribute('name', data.names[columnHashName]);
    path.setAttribute('fill', 'none');
    chart.svg.appendChild(path);
  }
}

function renderData(chart, data) {
  console.log('chart, data', chart, data);
  // cookData(chart, data)
  renderPath(chart, data);
}

function create(placement, config){
  const chart = {};
        // canvas = document.createElement('svg');
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('style', 'border: 1px solid black');
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute('width', '600');
  svg.setAttribute('height', '300');
  svg.setAttribute('viewBox', `0 0 ${config.width} ${config.height}`);
  
  // canvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // canvas.setAttribute('width', config.width+'px');
  // canvas.setAttribute('height', config.height+'px');
  placement.append(svg);

  chart.svg = svg;
  chart.config = config;
  return {
    renderData: (data)=> renderData(chart, data)
  }
}

export default {
  create: create
}