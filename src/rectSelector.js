function createRect(x, y, width, height, styles) {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('style', styles.join(''));
  return rect;
}

export function create(canvas,x, y, width, height) {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'), 
      sidesWidth = 20,
      centerRect, leftRect, rightRect;

  svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  
  svg.setAttribute('x', x);
  svg.setAttribute('y', y);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  // centerRect = createRect(width - size, 0, size, height, ['opacity:','0.2;'])
  // svg.appendChild(centerRect);
 
  leftRect = createRect(0, 0, sidesWidth, height, ['opacity:','0.2;'])
  svg.appendChild(leftRect);

  rightRect = createRect(width - sidesWidth, 0, sidesWidth, height, ['opacity:','0.2;'])
  svg.appendChild(rightRect);

  canvas.appendChild(svg);
  
  return {
    element: svg
  }
}
