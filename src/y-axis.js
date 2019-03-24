import {pipe, createSvgElem, setViewBox, setViewPort, setAttr, setAttrs} from "./common.js"

export function add(placement, bBox, maxValue, limit){
  let svg = createSvgElem('g', 'y-axi'),
      y_offset = bBox.height / (limit * 4),
      data_offset = y_offset / bBox.height * maxValue,
      chartStepSize, dataStepSize,
      textContent,
      textInitPosition, lineInitPosition;

  chartStepSize = (bBox.height - y_offset) / limit;
  dataStepSize = (maxValue - data_offset) / limit;
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

  }
}