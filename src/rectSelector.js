function createRect(x, y, width, height, styles) {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('style', styles.join(''));
  return rect;
}

export function create(canvas, width, height, size) {
  let group = document.createElementNS("http://www.w3.org/2000/svg", 'g'), 
      sidesWidth = 20,
      centerRect, leftRect, rightRect;

  centerRect = createRect(width - size, 0, size, height, ['opacity:','0.2;'])
  group.appendChild(centerRect);
 
  leftRect = createRect(width - size, 0, sidesWidth, height, ['opacity:','0.2;'])
  group.appendChild(leftRect);

  rightRect = createRect(width - sidesWidth, 0, sidesWidth, height, ['opacity:','0.2;'])
  group.appendChild(rightRect);

  canvas.appendChild(group);
  
  return {
    rect: group
  }
}
