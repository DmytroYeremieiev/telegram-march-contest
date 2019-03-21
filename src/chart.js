import {add as addDraggableSelector} from "./draggableSelector.js"
import {pipe, createSvg, setViewBox, setViewPort} from "./common.js"

function renderLine(chart, line, minValue) {
  let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
      {y_step_coefficient, x_step_size, viewBox} = chart,
      d = '',
      x = 0, y = null;
  for (let j = 0; j < line.data.length; j++) {
    const prefix = j === 0 ? 'M' : 'L';
    y = viewBox.height - (line.data[j] - minValue)*y_step_coefficient;
    d += prefix + x +','+ y;
    // if (y < 0) {
    //   console.log('j, line.data[j], x, y', j, line.data[j], x, y)
    // }
    x += x_step_size;
  }
  path.setAttribute('d', d);
  path.setAttribute('stroke', line.color);
  path.setAttribute('name', line.name);
  path.setAttribute('fill', 'none');
  chart.svg.appendChild(path);
}

function render(_) {
  console.log('_ :', _);
  Object.values(_.lines).forEach((line)=>{
    renderLine(_.viewAllChart, line, _.minValue);
    // renderLine(_.panViewSvg.svg, line, _.panViewSvg.viewBox.height,  _.panViewSvg.y_step_coefficient, _.minValue , _.x.stepSize * 6);
    // let panViewSvg_viewBoxHeight = _.viewBoxWidth;
    // let panViewSvg_y_step_coefficient = _.viewBoxWidth / (_.maxValue - _.minValue);
    // let panViewSvg_stepSize = Math.ceil(_.containerWidth * 4 / (_.x.steps.length - 1));

    // renderLine(_.panViewSvg, line, panViewSvg_viewBoxHeight, panViewSvg_y_step_coefficient, _.minValue , panViewSvg_stepSize);
  });
  addDraggableSelector(_.viewAllChart.svg, 0.5, 0.2, 0.05).onSelected((x, width)=>{
    console.log('onSelected', x, width)
  });
}

function getProportions(x_steps, containerWidth, minValue, maxValue, ratio) {
  let viewBoxWidth, viewBoxHeight, y_step_coefficient, x_step_size;
  x_step_size = Math.ceil(containerWidth / (x_steps.length - 1));
  viewBoxWidth = x_step_size * (x_steps.length - 1);
  viewBoxHeight = viewBoxWidth * ratio;
  y_step_coefficient = viewBoxHeight / (maxValue - minValue);

  return {
    viewBox: {x: 0, y: 0, width: viewBoxWidth, height: viewBoxHeight},
    x_step_size,
    y_step_coefficient
  };
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
    }
  });
  _.lines = lines;
  _.x = x;
  _.minValue = Math.min.apply(null, totalData);
  _.maxValue = Math.max.apply(null, totalData);
  return _
}

function setContainerSize(_) {
  const props = window.getComputedStyle(_.placement);
  _.containerWidth = _.placement.clientWidth - parseFloat(props.paddingLeft) - parseFloat(props.paddingRight);
  // _.containerWidth = _.placement.clientHeight - parseFloat(props.paddingTop) -  parseFloat(props.paddingBottom);
  return _
}

function createChart(id, styles) {
  let svg = createSvg(id, styles);
  return {
    svg: svg,
    viewPort: null,
    viewBox: null, 
    y_step_coefficient: 1,
    x_step_size: 1,
    setViewPort: function(viewPort) {
      this.viewPort = viewPort || this.viewPort;
      setViewPort(svg, this.viewPort);
    },
    setViewBox: function(viewBox) {
      this.viewBox = viewBox || this.viewBox;
      setViewBox(svg, this.viewBox);
    }
  };
}

function create(placement, config, data){
  const chart = {};

  chart.config = config;
  chart._ = pipe(
    setContainerSize,
    prepareData 
  )({placement: placement, data: data});

  chart._.viewAllChart = Object.assign(
    createChart('createChart', ['border:', '1px solid black;'] ), 
    getProportions(chart._.x.steps, chart._.containerWidth, chart._.minValue, chart._.maxValue, 1/6)
  );
  chart._.viewAllChart.setViewBox();

  chart._.panViewChart = Object.assign(
    createChart('createChart', ['border:', '1px solid black;'] ), 
    getProportions(chart._.x.steps, chart._.containerWidth, chart._.minValue, chart._.maxValue, 1)
  );
  chart._.panViewChart.setViewPort(chart._.panViewChart.viewBox);
  chart._.panViewChart.setViewBox();

  placement.append(chart._.panViewChart.svg);
  placement.append(chart._.viewAllChart.svg);
  return {
    render: _=> render(chart._)
  }
}

export default {
  create: create
}