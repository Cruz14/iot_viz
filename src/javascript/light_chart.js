var d3 = require('d3');
var variableWidthSTR = d3.select("body").style("width");
var variableWidth = parseInt(variableWidthSTR.substring(0, variableWidthSTR.length - 2));

var margin = {top: 20, right: 60, bottom: 30, left: 140},
    width = variableWidth - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var tooltipLigth = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

var sizeOnView = {
  active:true
}

// chart global Scales
var y = d3.scaleLinear()
  .domain([0,7])
  .range([0, 300]);

// symbology Scales
var xColors = d3.scaleLinear()
    .domain([0,6])
    .range([0, 240]);
var xConsumptionPos = d3.scaleLinear()
    .domain([0,4])
    .range([0, 200]);
var xConsumption = d3.scaleLinear()
    .domain([0,4])
    .range([0, 4]);

var colorsCodes = ['#b3b3b3','#fedb72','#fec44f','#fe9929','#ec7014','#cc4c02'];


function colorSelection(num){
  if (num == 0 ) {
    return colorsCodes[0];
  }
  if (num >= 1 && num <= 30){
    return colorsCodes[1];
  }
  if (num > 30 && num <=60 ){
    return colorsCodes[2];
  }
  if (num > 60 && num <=90){
    return colorsCodes[3];
  }
  if (num > 90 && num <=120){
    return colorsCodes[4];
  }
  if (num > 120) {
    return colorsCodes[5];
  }
}


function init(query,data, min_max,firstQuery) {

  d3.select("#total_consum")
    .html(min_max.sum_wats + " kWh")

  d3.select("#ave_brig")
    .html(min_max.mean_brightness + "%")

  d3.select("#current_query")
    .html(query)

  if (firstQuery) {
    createSymbology(svg, min_max)
  }

  d3.selectAll(".minMotion")
    .text(min_max.min_motion)
  d3.selectAll(".maxMotion")
    .text(min_max.max_motion)

  d3.selectAll(".minConsum")
    .text(min_max.min_wats.toFixed(2))
  d3.selectAll(".maxConsum")
    .text(min_max.max_wats.toFixed(2))


  var x = d3.scaleTime()
    .domain([new Date(data[0].time), new Date(data[data.length - 1].time)])
    .range([0, width]);

  var colorScale = d3.scaleLinear()
    .domain([min_max.min_motion, min_max.max_motion])
    .range([0,150])

  var watsScale = d3.scaleLinear()
    .domain([min_max.min_wats, min_max.max_wats])
    .range([2,12])

  x.ticks(d3.timeMinute, 15);

  var xAxis = d3.axisTop(x)

  var yAxis = d3.axisLeft(y)
      .tickFormat( function(index) {
        var labels = ["","Light 1","Light 2","Light 3","Light 4","Light 5","Light 6" ];
        return labels[index];
      })

  var svg = d3.select('#light_chart').append("svg")
    .attr("class","svg_chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var chartCont = svg.append("g")
      .attr("class", "chartCont")
      // .attr("x", 100)

  hideLoader()
      
  chartCont.append("g")
      .attr("class", "light x axis")
      .call(xAxis)

  chartCont.append("g")
      .attr("class", "light y axis")
      .call(yAxis)
      .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-60px")

  var dotsCont = chartCont.append("g")
      .attr("class", "dotsCont")

  var dots = dotsCont.selectAll(".dot")
      .data(data)
  dots.enter().append("circle")
    .attr("class", function(d) {
      return "dot c" + colorSelection(Math.round(colorScale(d.motion))).substr(1) + mapSize( watsScale(d.wats) )
    })
    .attr("fill", function(d) {return  colorSelection(Math.round(colorScale(d.motion))) })
    .on("mouseover", function(d) {
            d3.selectAll(".dot")
              .transition()
              .style("opacity", 0.1)
            d3.select(this)
              .transition()
              .attr("r", function(d) {return watsScale(d.wats) + 2 })
              .attr("fill", function(d) {return  colorSelection(Math.round(colorScale(d.motion))) })
            tooltipLigth.transition()    
                .duration(200)
                .style("opacity", .9)
            tooltipLigth.html("<b>On </b>" + ( d.timeDate.getMonth() + 1 ) +"/" + ( d.timeDate.getDate()) +"/"+ d.timeDate.getFullYear() + "<br/><br/>"+ "<b>Brightness: </b>" + d.brightness.toFixed(2)+ "%" + "<br/>"+ "<b>Consumption: </b>" + d.wats.toFixed(2) + " kWh" +" <br/>"+ "<b>Motion: </b>" + d.motion +" times fired")
                .style("left", function(){
                  if (d3.event.pageX > variableWidth /2) {
                    return (d3.event.pageX - 170) + "px";
                  }else{
                    return (d3.event.pageX) + "px";
                  }
                })
                .style("top", (d3.event.pageY - 90) + "px")
            })          
    .on("mouseout", function(d) { 
        d3.selectAll(".dot")
              .transition()
              .style("opacity", 1)
        d3.select(this)
              .transition()
              .attr("r", function(d) {return watsScale(d.wats) }) 
        tooltipLigth.transition()
            .duration(300)
            .style("opacity", 0)
    })
    .transition().duration(750).delay(function(d, i) { return i * 2; })
    .attr("r",  function(d) {return watsScale(d.wats)})
    .attr("cx", function(d) {return x(new Date(d.time)) })
    .attr("cy", function(d) {return y(d.sensorNum); })
    // .transition().duration(300).delay(function(d, i) { return i * 2; })
    // .attr("r", function(d) {return watsScale(d.wats)})
}

function createSymbology(svg){
  var symbologyCont = d3.select("#symbologyContainer").append("svg")
      .attr("class","svg_symbology")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 100)
      .append("g")
        .attr("transform", "translate(" + 30 + "," + margin.top + ")");

  var motionSensing = symbologyCont.append("g")
    .attr("class","motionSensing")
  motionSensing.append("text")
    .attr("x",0)
    .attr("class","howToTittle")
    .text("MOTION SENSING:")
  motionSensing.append("text")
    .attr("x",0)
    .attr("y", 60)
    .attr("class","minMotion")
  motionSensing.append("text")
    .attr("x",240)
    .attr("y", 60)
    .attr("class","maxMotion")
  var motionSymbology = motionSensing.append("g")
    .attr("x",0)

  motionSymbology.selectAll(".bar")
      .data(colorsCodes)
    .enter().append("rect")
      .style("opacity", 0)
      .attr("x",function(d,i){ return xColors(i) })
      .attr('y', 30)
      .attr("width",40)
      .attr("height",12)
      .style("fill", function(d,i){ return colorsCodes[i] })
      .on("mouseover", function(d,i) {
            d3.selectAll(".dot")
              .transition()
              .style("opacity", 0.2)
            d3.selectAll(".c" + colorsCodes[i].substr(1))
              .transition()
              .style("opacity", 1)
            })
      .on("mouseout", function(d,i) {
            d3.selectAll(".dot")
              .transition()
              .style("opacity", 1)
            })
      .transition().duration(750)
        .style("opacity", 1)

  var consumptionCont = symbologyCont.append("g")
    .attr("class","consumptionCont")
  consumptionCont.append("text")
    .attr("x",320)
    .attr("class","howToTittle")
    .text("CONSUMPTION:")
  consumptionCont.append("text")
    .attr("x",320)
    .attr("y", 60)
    .attr("class","minConsum")
  consumptionCont.append("text")
    .attr("x",480)
    .attr("y", 60)
    .attr("class","maxConsum")
  var consumptionSymbology = consumptionCont.append("g")
    .attr("x",320)

  var consumptionData = [{size:"min",num:3},{size:"low",num:6},{size:"mid",num:9},{size:"max",num:12}]
  consumptionSymbology.selectAll(".dot_symbology")
      .data(consumptionData)
    .enter().append("circle")
      .style("opacity", 0)
      .attr("cx",function(d,i){ return xConsumptionPos(i) + 330 })
      .attr("cy", function(d,i){ return 35 - (i * 3 )})
      .attr("r", function(d,i){ return xConsumption(d.num) })
      .style("fill", "#363f49")
      .style("stroke", "#f2f2f2")
      // .on("click", function(d,i){
      //   d3.selectAll(".dot").style("opacity", 1);
      //   // Determine if current line is visible
      //   // var active   = sizeOnView.active ? false : true ,
      //   //   newOpacity = active ? 0 : 1;
      //   // Hide or show the elements
      //     // d3.selectAll(".dot").style("opacity", (newOpacity * -1));
      //     d3.selectAll(".dot" ).style("opacity", 0);
      //     d3.selectAll("." + d.size ).style("opacity", 1);
      //     if (active) {
      //       d3.selectAll(".dot" ).style("opacity", newOpacity);
      //     }

        
      //   // Update whether or not the elements are active
      //   sizeOnView.active = active;
      // })
      .on("mouseover", function(d,i) {
            d3.selectAll(".dot")
              .transition()
              .style("opacity", 0.2)
            d3.selectAll("."+d.size)
              .transition()
              .style("opacity", 1)
            })
      .on("mouseout", function(d,i) {
            d3.selectAll(".dot")
              .transition()
              .style("opacity", 1)
            })
      .transition().duration(750)
        .style("opacity", 1)
}

function mapSize(value){
    var roundVal = Math.round(value);
    if (roundVal >= 0 && roundVal <= 3 ) {
      return " min"
    }
   if (roundVal > 3 && roundVal <= 6 ) {
      return " low"
    }
   if (roundVal > 6 && roundVal <= 9 ) {
      return " mid"
    }
   if (roundVal > 9 ) {
      return " max"
    }
}

function hideLoader(){
  d3.select('.loader')
    .style("display", "none")
}

module.exports = {
  init: init,
};
