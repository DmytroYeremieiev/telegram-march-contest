import {add as addDraggableSelector} from "./draggableSelector.js"
import {add as addCheckbox} from "./checkbox.js"
import {add as addYaxi} from "./y-axis.js"

import {pipe, createSvgElem, setViewBox, setViewPort, setAttr, setAttrs, getMousePosition} from "./common.js"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const yBottomPadding = 40;

function formatDate(dateTimestamp) {
  const d = new Date(dateTimestamp);
  return monthNames[d.getMonth()] + ' ' + d.getDate();
}

function createXaxi(placement, xAxi, config, limit) {
  let {x_step_size, viewBox} = config,
      textWidthOffset = 44/2,
      x = 0, y = viewBox.height - 10;
  let x_map = [];
  let {start, amount} = mapViewBoxToDataIndex(0, viewBox.width, x_step_size);
  let showEvery = Math.ceil(amount/limit);
  // console.log("amount:", amount, "showEvery: ", showEvery);
  for (let j = 0; j < xAxi.data.length; j++) {
    let text = createSvgElem('text');
    setAttrs(text, [['x', x],['y', y], ['class','x-axi-text hide']]);
    text.textContent = formatDate(xAxi.data[j]);
    if (j % showEvery === 0) showElement(text, true);
    placement.appendChild(text);
    x_map.push({
      svg: text,
      x: x
    });
    x += x_step_size;
  }
  return {
    placement,
    x_map,
    x: 0,
    width: viewBox.width,
    x_step_size,
    showEvery,
    update: function(x, width) {
      let {amount} = mapViewBoxToDataIndex(x, width, x_step_size);
      let ratio = this.width/width;
      // console.log("createXaxi:update", `${this.start} -> ${start}, ${this.amount}->${amount}`);
      setAttr(this.placement, 'transform',  `translate(${this.x - x*ratio} 0)`);
      let showEvery = Math.ceil(amount/limit);
      for (let i = 0; i < this.x_map.length; i++) {
        setAttr(x_map[i].svg, 'dx',  x_map[i].x*ratio-x_map[i].x);
        if (i % showEvery === 0 || i === this.x_map.length - 1) {
          showElement(x_map[i].svg, true);
        }else {
          showElement(x_map[i].svg, false);
        }
      }
    }
  };
}

function createLine(placement, line, config) {
  let path = createSvgElem('path', line.name),
      {y_step_coefficient, x_step_size, viewBox} = config,
      d = '',
      x = 0, y = null;
  let pathInfo = {};
  for (let j = 0; j < line.data.length; j++) {
    const prefix = j === 0 ? 'M' : 'L';
    y = viewBox.height - line.data[j]*y_step_coefficient;
    d += ' ' + prefix + x +','+ y + ' ';
    pathInfo[j] = {
      x, y,
      path: path,
      name: line.name,
      color: line.color,
      value: line.data[j]
    };
    x += x_step_size;
  }
  setAttrs(path, [['d',d],['stroke',line.color],['fill','none']])
  placement.appendChild(path);
  return pathInfo;
}

function showElement(elem, show) {
  show ? elem.classList.remove('hide') : elem.classList.add('hide');
}

function scaleGroup(linesGroup, newMaxValue, prevMaxValue, height) {
  let deltaRatio,
      Y_translate_size, Y_scale_coef;
  if (!isFinite(newMaxValue)) {
    setAttr(linesGroup, 'transform',  `matrix(1 0 0 1 0 ${-height*2})`);
    return;
  }
  deltaRatio = newMaxValue / prevMaxValue;
  Y_scale_coef = 1 / deltaRatio;
  Y_translate_size = height * deltaRatio - height;
  // console.log(`deltaRatio: ${deltaRatio}, height: ${height}, Y_translate_size: ${Y_translate_size}, Y_scale_coef: ${Y_scale_coef}`);
  let matrix = [1, 0, 0, Y_scale_coef, 0, (newMaxValue !== prevMaxValue?Y_translate_size*Y_scale_coef:0),];
  setAttr(linesGroup, 'transform',  `matrix(${matrix.join(' ')})`);
}

function mapViewBoxToDataIndex(x, width, x_step_size) {
  let start = x/x_step_size, 
      amount = width/x_step_size;
  return {
    start: Math.round(start),
    amount: Math.round(amount)
  }
}

function getTotalDataInRange(x, width, x_step_coefficient, x_step_size, lines) {
  let {start, amount} = mapViewBoxToDataIndex(x*x_step_coefficient, width*x_step_coefficient, x_step_size);
  // console.log("getTotalDataInRange", {start, amount});
  return Object.values(lines)
    .filter((l)=>l.checked)
    .map((l)=>l.data.slice(start, start+amount))
    .reduce((s, n)=> s.concat(n), []);
}

function createInfoPopup(svg, viewBox, linesInfo) {
  let g = createSvgElem('g', null, null, ['popup']);
  setAttr(g, 'transform', `translate(${linesInfo[0].x} 0)`)
  let hLine = createSvgElem('line', null, null, ['popup']);
  setAttrs(hLine, [['class', 'popup-line'], ['x1',0], ['y1',0], ['x2', 0], ['y2', viewBox.height - 30]]);
  g.appendChild(hLine);

  let circles = [];
  function createCircle(l){
    let circle = createSvgElem('circle', null, null, ['popup-circle']);
    setAttrs(circle, [['stroke', l.color], ['transform', `translate(0 ${l.y})`], ['cx', 0], ['cy', 0], ['r', 5]]);
    return circle;
  }
  linesInfo.forEach((l)=>{
    let circle = createCircle(l);
    g.appendChild(circle);
    circles.push(circle);
  });


  let rect = createSvgElem('rect', null, null, ['popup-rect']);
  let text = createSvgElem('popup-text', null, null, ['popup-rect']);
  text.textContent = "arsarsars";

  g.appendChild(rect);
  g.appendChild(text);

  svg.appendChild(g);
  return {
    update: function (linesInfo, matrixCTM = {d: 1}, transformMatrix = {d: 1, f: 0}) {
      let gX = linesInfo[0].x * matrixCTM.a + matrixCTM.e;
      setAttr(g, 'transform', `translate(${gX} 0)`);
      linesInfo.forEach((l, i) => {
        let circle = circles[i],
            cY = (l.y * transformMatrix.d + transformMatrix.f ) * matrixCTM.d;
        if (!circle) {
          circle = createCircle(l);
          g.appendChild(circle);
          circles.push(circle);
        }
        console.log('matrixCTM, transformMatrix');
        setAttr(circle, 'transform', `translate(0 ${cY})`);
      })
    }
  }
}

function addHoverPopup(config) {
  let {linesSvg, linesGroup, svg, x_step_size, lines} = config;
  let viewBox = linesSvg._viewBox;
  let infoPopup = createInfoPopup(svg, viewBox, [{x: viewBox.width/2, y: 0}]);

  svg.addEventListener('mousemove', (evt)=>{
    viewBox = linesSvg._viewBox ? linesSvg._viewBox : linesSvg.getBBox();
    let {x} = getMousePosition(evt, linesSvg);
    let {start} = mapViewBoxToDataIndex(x, viewBox.width, x_step_size);
    let linesInfo = Object.values(lines).map((l)=>l[start]);
    console.log(`mouse position: ${x}, dataIndex[${start}]`, linesInfo);
    infoPopup.update(linesInfo, linesSvg.getCTM(), linesGroup.transform.baseVal[0] && linesGroup.transform.baseVal[0].matrix);
  });
}

function render(_) {
  console.log('_ :', _);
  addHoverPopup(_.panViewChart);
  let y_axi = addYaxi(_.panViewChart.svg, _.maxValue, Object.assign({}, _.panViewChart.viewBox, {height: _.panViewChart.viewBox.height - yBottomPadding}), 5);
  let x_axi = createXaxi(_.panViewChart.xAxiGroup, _.x, _.panViewChart, 7);
  Object.values(_.lines).forEach((line)=>{
    _.panViewChart.lines[line.name] = createLine(_.panViewChart.linesGroup, line, _.panViewChart);
    _.viewAllChart.lines[line.name] = createLine(_.viewAllChart.group, line, _.viewAllChart);
    line.checked = true;
    addCheckbox(_.placement, line.color, line.name, line.checked, (checked)=>{
      line.checked = checked;
      showElement(_.panViewChart.lines[line.name].path, checked);
      let data = Object.values(_.lines).filter((l)=>l.checked).reduce((s, n)=> s.concat(n.data), []);
      let newMaxValue = Math.max.apply(null, data);
      y_axi.update(newMaxValue);
      scaleGroup(_.panViewChart.linesGroup, newMaxValue, _.maxValue, _.panViewChart.viewBox.height);
    });
  });
  let timer = null;
  addDraggableSelector(_.viewAllChart.svg, 0, _.viewAllChart.viewBox.height, 0.025)
    .onDrag((x, width)=>{
      console.log('onDrag', x, width, x*_.panViewChart.x_step_coefficient, width*_.panViewChart.x_step_coefficient);
      setViewBox(_.panViewChart.linesSvg, {x: x*_.panViewChart.x_step_coefficient, width: width*_.panViewChart.x_step_coefficient});
      x_axi.update(x*_.panViewChart.x_step_coefficient, width*_.panViewChart.x_step_coefficient);
      if(timer) return;
      timer = setTimeout(()=> {
        timer = null;
        let data = getTotalDataInRange(x, width, _.viewAllChart.x_step_coefficient, _.viewAllChart.x_step_size, _.lines);
        let newMaxValue = Math.max.apply(null, data);
        y_axi.update(newMaxValue);
        scaleGroup(_.panViewChart.linesGroup, newMaxValue, _.maxValue, _.panViewChart.viewBox.height);
      }, 100)

    })
    .onDragEnd((x, width)=>{
      clearTimeout(timer);
      timer = null;
      x_axi.update(x*_.panViewChart.x_step_coefficient, width*_.panViewChart.x_step_coefficient);
      let data = getTotalDataInRange(x, width, _.viewAllChart.x_step_coefficient, _.viewAllChart.x_step_size, _.lines);
      let newMaxValue = Math.max.apply(null, data);
      y_axi.update(newMaxValue);
      scaleGroup(_.panViewChart.linesGroup, newMaxValue, _.maxValue, _.panViewChart.viewBox.height);
      // console.log('onDragEnd', x, width, x*_.panViewChart.x_step_coefficient, width*_.panViewChart.x_step_coefficient);
    });
  let defaultPanView = {
    x:  0,
    width: _.viewAllChart.viewBox.height*_.panViewChart.x_step_coefficient
  };
  setViewBox(_.panViewChart.linesSvg, {x: defaultPanView.x, width: defaultPanView.width});
  x_axi.update(defaultPanView.x, defaultPanView.width);
}
function getProportions(x_steps, viewBox, maxValue, x_step_coefficient) {
  let y_step_coefficient, x_step_size;
  x_step_size = +parseFloat(viewBox.width * x_step_coefficient / (x_steps.length - 1)).toPrecision(8);
  y_step_coefficient = viewBox.height / maxValue;
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
      x.data = column;
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
    setViewBox: function(viewBox) {
      Object.assign(this.viewBox, viewBox);
      setViewBox(svg, this.viewBox);
    }
  };
}

function create(placement, data){
  const chart = {}, 
        panViewChartSidesRatio = 1,
        viewAllChartSidesRatio = 1/6;

  chart._ = pipe(
    setContainerSize,
    prepareData
  )({placement: placement, data: data});

  chart._.panViewChart = createChart('panViewChart', null, panViewChartSidesRatio);
  setAttr(chart._.panViewChart.svg, "preserveAspectRatio", "none");
  chart._.panViewChart.setViewBox({width: chart._.containerWidth, height: chart._.containerWidth + yBottomPadding});
  Object.assign(chart._.panViewChart, getProportions(chart._.x.data, chart._.panViewChart.viewBox, chart._.maxValue, 1/viewAllChartSidesRatio));

  chart._.panViewChart.linesSvg = createSvgElem('svg', 'lines-svg');
  setAttr(chart._.panViewChart.linesSvg, "preserveAspectRatio", "none");
  setViewPort(chart._.panViewChart.linesSvg, {x: 0, y: 0, width: chart._.containerWidth, height: chart._.containerWidth * panViewChartSidesRatio});
  setViewBox(chart._.panViewChart.linesSvg, {width: chart._.containerWidth, height: chart._.containerWidth + yBottomPadding});

  chart._.panViewChart.linesGroup = createSvgElem('g', 'lines-group');
  chart._.panViewChart.xAxiGroup = createSvgElem('g', 'x-axi-group');
  chart._.panViewChart.linesSvg.append(chart._.panViewChart.linesGroup);
  chart._.panViewChart.svg.append(chart._.panViewChart.linesSvg);
  chart._.panViewChart.svg.append(chart._.panViewChart.xAxiGroup);


  chart._.viewAllChart = createChart('viewAllChart', ['border:', '1px solid black;'], viewAllChartSidesRatio);
  chart._.viewAllChart.setViewBox({width: chart._.containerWidth, height: chart._.containerWidth * viewAllChartSidesRatio});
  Object.assign(chart._.viewAllChart, getProportions(chart._.x.data, chart._.viewAllChart.viewBox, chart._.maxValue, panViewChartSidesRatio));
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