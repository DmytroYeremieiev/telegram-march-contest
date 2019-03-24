import {pipe, createSvgElem, setViewBox, setViewPort, setAttr, setAttrs} from "./common.js"


function configure(maxValue, bBox, limit) {
  let y_offset = bBox.height / (limit * 4);
  let data_offset = y_offset / bBox.height * maxValue;
  let chartStepSize = (bBox.height - y_offset) / limit;
  let dataStepSize = (maxValue - data_offset) / limit;
  return {
    y_offset, data_offset,
    chartStepSize, dataStepSize
  }
}


function update(maxValue, axiInfo) {
  let {bBox, limit, labels} = axiInfo;
  let {data_offset, dataStepSize} = configure(maxValue, bBox, limit);
  let textContent = maxValue -  data_offset;
  for (let i = 0; i < limit; i++) {
    if(!isFinite(textContent)) {
      labels[i].textContent = '';
      continue;
    }
    labels[i].textContent = Math.round(textContent);
    textContent = textContent - dataStepSize;
  }
}

export function add(placement, maxValue, bBox, limit){
  let svg = createSvgElem('g', 'y-axi'),
      {y_offset, data_offset, chartStepSize, dataStepSize} = configure(maxValue, bBox, limit),
      textContent,
      textInitPosition, lineInitPosition;

  let axiInfo = {
    bBox: bBox,
    limit: limit,
    labels: []
  };

  textContent = maxValue -  data_offset;

  textInitPosition = {
    x: 0, y: y_offset
  };
  lineInitPosition = {
    x1: 0, y1: y_offset + 10, x2: bBox.width, y2: y_offset + 10
  };

  while (limit >= 0){
    limit -= 1;
    let text = createSvgElem('text');
    setAttrs(text, [['x',textInitPosition.x],['y', textInitPosition.y], ['class','y-axi-text']]);
    text.textContent = Math.round(textContent);
    axiInfo.labels.push(text);
    svg.appendChild(text);
    textInitPosition.y += chartStepSize;
    textContent = textContent - dataStepSize;

    let line = createSvgElem('line');
    setAttrs(line, [
      ['x1',lineInitPosition.x1],['y1',lineInitPosition.y1],
      ['x2',lineInitPosition.x2], ['y2', lineInitPosition.y2],
      ['class','y-axi-line']
    ]);
    svg.appendChild(line);
    lineInitPosition.y1 = lineInitPosition.y2 = lineInitPosition.y1 + chartStepSize;
  }

  placement.insertBefore(svg, placement.firstChild);
  return {
    update: (maxValue)=> update(maxValue, axiInfo)
  }
}