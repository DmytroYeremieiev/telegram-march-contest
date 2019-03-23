import {add as addDraggableSelector} from "./draggableSelector.js"
import {add as addCheckbox} from "./checkbox.js"
import {pipe, createSvgElem, setViewBox, setViewPort, setAttr} from "./common.js"

function renderLine(chart, line, minValue) {
  let path = createSvgElem('path', line.name),
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
  path.setAttribute('fill', 'none');
  chart.lines[line.name] = {};
  chart.lines[line.name].path = path;
  chart.lines[line.name].path = path;
  // chart.svg.appendChild(path);
  chart.group.appendChild(path);
}

function showLine(line, show) {
  show ? line.classList.remove('hide') : line.classList.add('hide');
}

function scaleGroup(linesGroup, linesData, minValue, maxValue, height) {
  let newMin, newMax, newDelta, 
      prevDelta = maxValue - minValue,
      deltaRatio,
      Y_translate_size, Y_scale_coef;
  let newTotalData = linesData.filter((l)=>l.checked).reduce((s, n)=> s.concat(n.data), []);
  newMin = Math.min.apply(null, newTotalData);
  newMax = Math.max.apply(null, newTotalData);
  newDelta = newMax - newMin;
  deltaRatio = newDelta / prevDelta;
  Y_scale_coef = 1 / 1 / deltaRatio;
  Y_translate_size = height * deltaRatio - height;
  console.log(`deltaRatio: ${deltaRatio}, height: ${height}, Y_translate_size: ${Y_translate_size}, Y_scale_coef: ${Y_scale_coef}`);
  let transform = `scale(1 ${Y_scale_coef}) translate(0, ${Y_translate_size})`; 
  console.log('.... ', transform);
  setAttr(linesGroup, 'transform', transform);
}

function render(_) {
  console.log('_ :', _);
  Object.values(_.lines).forEach((line)=>{
    renderLine(_.viewAllChart, line, _.minValue);
    renderLine(_.panViewChart, line, _.minValue);
    line.checked = true;
    addCheckbox(_.placement, line.color, line.name, line.checked, (checked)=>{
      // console.log(`${line.name} checked`, checked);
      line.checked = checked;
      showLine(_.panViewChart.lines[line.name].path, checked);
      scaleGroup(_.panViewChart.group, Object.values(_.lines), _.minValue, _.maxValue, _.panViewChart.viewBox.height);
    });
  });
  addDraggableSelector(_.viewAllChart.svg, 0.5, _.viewAllChart.viewBox.height, 0.025).onSelected((x, width)=>{
    // console.log('onSelected', x, width, x*_.panViewChart.x_step_coefficient, width*_.panViewChart.x_step_coefficient);
    _.panViewChart.setViewBox({x: x*_.panViewChart.x_step_coefficient, width: width*_.panViewChart.x_step_coefficient})
  });
  _.panViewChart.setViewBox({x: _.viewAllChart.viewBox.width*0.5*_.panViewChart.x_step_coefficient, width: _.viewAllChart.viewBox.height*_.panViewChart.x_step_coefficient});
}
function getProportions(x_steps, viewBox, minValue, maxValue, x_step_coefficient) {
  let y_step_coefficient, x_step_size;
  x_step_size = +parseFloat(viewBox.width * x_step_coefficient / (x_steps.length - 1)).toPrecision(6);
  y_step_coefficient = viewBox.height / (maxValue - minValue);
  return {
    x_step_coefficient,
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

function createChart(id, styles, sides_ratio) {
  let svg = createSvgElem('svg', id, styles);
  return {
    svg: svg,
    viewPort: {},
    viewBox: {}, 
    sides_ratio: sides_ratio,
    x_step_coefficient: 1,
    x_step_size: 1,
    y_step_coefficient: 1,
    lines: {},
    group: null,
    setViewPort: function(viewPort) {
      Object.assign(this.viewPort, viewPort);
      setViewPort(svg, this.viewPort);
    },
    setViewBox: function(viewBox) {
      Object.assign(this.viewBox, viewBox);
      setViewBox(svg, this.viewBox);
    }
  };
}

function create(placement, config, data){
  const chart = {}, 
        panViewChartSidesRatio = 1,
        viewAllChartSidesRatio = 1/6;

  chart.config = config;
  chart._ = pipe(
    setContainerSize,
    prepareData
  )({placement: placement, data: data});

  chart._.panViewChart = createChart('createChart', ['border:', '1px solid black;'], panViewChartSidesRatio);
  setAttr(chart._.panViewChart.svg, "preserveAspectRatio", "none");
  chart._.panViewChart.setViewPort({x: 0, y: 0, width: chart._.containerWidth, height: chart._.containerWidth * panViewChartSidesRatio});
  chart._.panViewChart.setViewBox({width: chart._.containerWidth, height: chart._.containerWidth});
  Object.assign(chart._.panViewChart, getProportions(chart._.x.steps, chart._.panViewChart.viewBox, chart._.minValue, chart._.maxValue, 1/viewAllChartSidesRatio));
  chart._.panViewChart.group = createSvgElem('g', 'lines')
  chart._.panViewChart.svg.append(chart._.panViewChart.group);

  chart._.viewAllChart = createChart('createChart', ['border:', '1px solid black;'], viewAllChartSidesRatio);
  chart._.viewAllChart.setViewBox({width: chart._.containerWidth, height: chart._.containerWidth * viewAllChartSidesRatio});
  Object.assign(chart._.viewAllChart, getProportions(chart._.x.steps, chart._.viewAllChart.viewBox, chart._.minValue, chart._.maxValue, panViewChartSidesRatio));
//scale(1 2.1212) translate(0, -251.6)
  chart._.viewAllChart.group = createSvgElem('g', 'lines')
  chart._.viewAllChart.svg.append(chart._.viewAllChart.group);

  placement.append(chart._.panViewChart.svg);
  placement.append(chart._.viewAllChart.svg);
  return {
    render: _=> render(chart._)
  }
}

export default {
  create: create
}