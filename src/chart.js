import {add as addDraggableSelector} from "./draggableSelector.js"
import {pipe} from "./common.js"

function renderLine(svg, line, viewBoxHeight, y_step_coefficient, minValue, stepSize) {
  let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
      d = '',
      x = 0, y = null;
  for (let j = 0; j < line.data.length; j++) {
    const prefix = j === 0 ? 'M' : 'L';
    y = viewBoxHeight - (line.data[j] - minValue)*y_step_coefficient;
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
  Object.values(_.lines).forEach((line)=>{
    renderLine(_.viewAllSvg, line, _.viewBoxHeight, _.y_step_coefficient, _.minValue , _.x.stepSize);
    let panViewSvg_viewBoxHeight = _.viewBoxWidth;
    let panViewSvg_y_step_coefficient = _.viewBoxWidth / (_.maxValue - _.minValue);
    let panViewSvg_stepSize = Math.ceil(_.containerWidth * 4 / (_.x.steps.length - 1));

    renderLine(_.panViewSvg, line, panViewSvg_viewBoxHeight, panViewSvg_y_step_coefficient, _.minValue , panViewSvg_stepSize);
  });
  addDraggableSelector(_.viewAllSvg, 0.5, 0.2, 0.05).onSelected((x, width)=>{
    console.log('onSelected', x, width)
  });
}

function setProportions(_) {
  const {x, widthToHeigthRation} = _;
  _.viewBoxWidth = x.stepSize * (x.steps.length - 1);
  _.viewBoxHeight = _.viewBoxWidth * widthToHeigthRation;
  _.y_step_coefficient = _.viewBoxHeight / (_.maxValue - _.minValue);
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
      x.stepSize = Math.ceil(_.containerWidth / (x.steps.length - 1));
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

function createSvg(id, viewPort = {}, viewBox = {}, styles = []) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttributeNS(null, 'x', viewPort.x || '');
  svg.setAttributeNS(null, 'y', viewPort.y || '');
  svg.setAttributeNS(null, 'width', viewPort.width || '');
  svg.setAttributeNS(null, 'height', viewPort.height  || '');
  svg.setAttributeNS(null, 'viewBox', `${viewBox.x || 0} ${viewBox.y || 0} ${viewBox.width || 0} ${viewBox.height || 0}`);
  svg.setAttribute('id', id || '');
  svg.setAttribute('style', styles.join(''));
  return svg;
}

function create(placement, config, data){
  const chart = {};

  chart.config = config;
  chart._ = pipe(
    setContainerSize,
    prepareData 
  )({placement: placement, data: data});

  chart._.viewAllSvg = createSvg('viewAllSvg', 
    null,
    {x: 0, y: 0, width: chart._.viewBoxWidth, height: chart._.viewBoxHeight}, 
    ['border', '1px solid black;']
  );
  chart._.panViewSvg = createSvg('panViewSvg', 
    {x: 0, y: 0, width: chart._.viewBoxWidth, height: chart._.viewBoxWidth}, 
    {x: 0, y: 0, width: chart._.viewBoxWidth, height: chart._.viewBoxWidth}, 
    ['border', '1px solid black;']
  );

  chart._ = setProportions()

  placement.append(chart._.panViewSvg);
  placement.append(chart._.viewAllSvg);
  return {
    render: _=> render(chart._)
  }
}

export default {
  create: create
}