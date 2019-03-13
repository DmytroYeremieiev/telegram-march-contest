
function renderData(canvas, data, size) {
  console.log('canvas, data, size', canvas, data, size)
}

function create(placement, width, height){
  let canvas = document.createElement('svg');
  canvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  canvas.setAttribute('viewBox', `0 0 ${width} ${height}`);
  placement.append(canvas);
  return {
    renderData: (data, size)=> renderData(canvas, data, size)
  }
}

export default {
  create: create
}