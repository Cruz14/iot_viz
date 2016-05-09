// Declare D3 for all window
var d3 = require('d3');
var $ = require('jquery');
window.d3= d3;

// Require Data Controller
var Data = require('./data');

// Run Aplication
Data._9hQuery(true);

function toggleActiveChart(){
  $(".nav_item").click(function(e){
    e.preventDefault();
    if (!$(this).hasClass('active')) {
      $(".nav_item").removeClass('active');
      $(this).toggleClass('active');
      var time = $(this).data("time");
      removeChart();
      changeDate(time);
    }
  })
}

function removeChart(){
  d3.selectAll(".svg_chart").remove();
  $('.loader').show();
}

function changeDate(time){
  switch (time) {
    case "_9h":
        Data._9hQuery(false);
        break;
    case "_24h":
        Data._1dQuery(false);
        break; 
    case "_72h":
        Data._3dQuery(false);
        break; 
    case "_120h":
        Data._5dQuery(false);
        break; 
    case "_1m":
        Data._1mQuery(false);
        break;  
  }
}

toggleActiveChart()