import canvas from './canvas.js';

console.log("Hello!");

(async function() {
  let res = await fetch("./datasets.json");
  let data = await res.json();
  canvas.create(document.body, 300, 200).renderData(data.v1, 5);
})()


