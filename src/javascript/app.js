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
      if (time == "_9h") {
        removeChart();
        Data._9hQuery(false);
      }
      if (time == "_24h") {
        removeChart();
        Data._1dQuery(false);
      }
      if (time == "_72h") {
        removeChart();
        Data._3dQuery(false);
      }
      if (time == "_120h") {
        removeChart();
        Data._5dQuery(false);
      }
      if (time == "_1m") {
        removeChart();
        Data._1mQuery(false);
      }
    }
  })
}

function removeChart(){
  d3.selectAll(".dot")
          .transition()
          // .duration(750)
          .style("opacity","0")
          .on("end",function(){
            d3.selectAll(".svg_chart").remove();
            $('.loader').show();
          });
}

toggleActiveChart()