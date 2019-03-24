import {pipe, createSvgElem, setViewBox, setViewPort, setAttr, setAttrs} from "./common.js"

export function add(placement, max, limit){
  let svg = createSvgElem('g', 'y-axi'),
      bBox = placement.getBBox(),
      chartStepSize,
      dataStepSize;

  max = 300;

  chartStepSize = bBox.height / limit;
  dataStepSize = max / limit;

  let textInitPosition = {
    x: bBox.width / 50, y: 0
  };
  let textContent = max;
  let lineInitPosition = {
    x1: 0, y1: 0, x2: bBox.width, y2: 0
  };

  while (limit > 0){
    limit -= 1;
    textInitPosition.y += chartStepSize;
    let text = createSvgElem('text');
    setAttrs(text, [['x',textInitPosition.x],['y', textInitPosition.y], ['class','y-axi-text']]);
    text.textContent = textContent = textContent - dataStepSize;
    svg.appendChild(text);

    lineInitPosition.y1 = lineInitPosition.y2 = lineInitPosition.y1 + chartStepSize;
    let line = createSvgElem('line');
    setAttrs(line, [
      ['x1',lineInitPosition.x1],['y1',lineInitPosition.y1],
      ['x2',lineInitPosition.x2], ['y2', lineInitPosition.y2],
      ['class','y-axi-text']
    ]);
    svg.appendChild(line);
  }

  placement.appendChild(svg);
  return {

  }
}