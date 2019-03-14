import chart from './chart.js';

console.log("Hello!");

(async function() {
  let res = await fetch("./chart_data.json");
  let chart_data = await res.json();


  let config = {
    gridSize: 20,
    paddings: 20,
    width: 600,
    height: 300,
    xAxisValueMapper: (y)=> y / (1000*60*60*24),
    xAxisLabelMapper: (y)=> (new Date(y)).toDateString(),
    yAxisValueMapper: (x)=> e.joinedCount,
    yAxisLabelMapper: (x)=> e.joinedCount
  } 
  chart.create(document.getElementById('main-canvas'), config).renderData(chart_data[0]);
})()


