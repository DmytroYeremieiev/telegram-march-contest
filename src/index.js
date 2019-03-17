import chart from './chart.js';

// console.log("Hello!");

(async function() {
  let res = await fetch("./chart_data.json");
  let chart_data = await res.json();


  let config = {
    // gridSize: 20
  } 
  chart.create(document.getElementById('main-canvas'), config, chart_data[0]).render();
})()


