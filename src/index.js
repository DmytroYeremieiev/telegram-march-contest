import chart from './chart.js';

(async function() {
  let res = await fetch("./chart_data.json");
  let chart_data = await res.json();

  let container = document.getElementById('container');
  chart_data.forEach((chartData)=>{
    let placement = document.createElement('div');
    placement.classList.add('main-canvas');
    container.appendChild(placement);
    chart.create(placement, chartData).render();
  });

})();


