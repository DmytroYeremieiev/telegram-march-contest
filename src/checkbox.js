import {pipe, createSvgElem, setViewBox, setViewPort, setAttr, setAttrs} from "./common.js"

export function add(placement, color, label, checked, onChangeCallback){
  let svg, 
        fieldset,
        checkMarkSvg,
          circle,
          check,
        text;
  svg = createSvgElem('svg');
  setAttr(svg, 'viewBox', '0 0 150 50');
  if(checked){
    setAttr(svg, 'class', 'checkbox' + (checked?' checked': ''));
  }
  fieldset = createSvgElem('rect');
  setAttrs(fieldset, [['x', 1],['y',1],['width', 98], ['height', 48], ['fill', 'none'], ['stroke', 'black'], ['rx', 24],['ry', 24]]);
  svg.appendChild(fieldset);

  checkMarkSvg = createSvgElem('svg');
  setAttrs(checkMarkSvg, [['class', 'checkmark'], ['width', 35], ['x', '10'], ['viewBox', '0 0 52 52']]);
  circle = createSvgElem('circle');
  setAttrs(circle, [['class', 'checkmark__circle'],['cx','26'],['cy', '26'], ['r', '25'], ['fill', 'none']]);
  checkMarkSvg.appendChild(circle);
  check = createSvgElem('path');
  setAttrs(check, [['class', 'checkmark__check'], ['fill', 'none'],['d','M14.1 27.2l7.1 7.2 16.7-16.8']]);
  checkMarkSvg.appendChild(check);
  svg.appendChild(checkMarkSvg);

  text = createSvgElem('text');
  setAttrs(text, [['x', 55],['y',30],['fill', color]]);
  text.textContent = label;
  svg.appendChild(text);

  svg.addEventListener('click', ()=>{
    (checked = !checked) ? svg.classList.add('checked') : svg.classList.remove('checked');
    onChangeCallback(checked)
  });
  placement.appendChild(svg);
}