var d3 = require('d3');
var variableWidthSTR = d3.select("body").style("width");
var variableWidth = parseInt(variableWidthSTR.substring(0, variableWidthSTR.length - 2));
var _ = require('lodash');

var margin = {top: 20, right: 60, bottom: 10, left: 140},
    width = variableWidth - margin.left - margin.right,
    height = 140 - margin.top - margin.bottom;

var colors = ["#63DC3B", "#DE3C76", "#449C2D", "#DE4735", "#9CBB1C", "#D07717"];

function init(query,data, min_max,firstQuery) {

	var _data = _.groupBy(data, function(o) { return o.sensorNum; })

	var _data_array = _.map(_data,function(value,index){
		return [value];
	})

	var x = d3.scaleTime()
	  .domain([new Date(data[0].time), new Date(data[data.length - 1].time)])
	  .range([0, width]);

	var motionScale = d3.scalePow()
		.exponent(5)
	    .domain([min_max.min_motion, min_max.max_motion])
	    .range([height,40])

	var watsScale = d3.scalePow()
		.exponent(5)
	    .domain([min_max.min_wats, min_max.max_wats])
	    .range([height,40])

	var colorScale = d3.scaleLinear()
	  .range(0,5)
	  .domain(0,5)

	var xAxis = d3.axisTop(x)

	var yAxis = d3.axisLeft(watsScale)

	var areaWats = d3.line()
	  .x(function(d) { return x(new Date(d.time)) })
	  // .y0(height + margin.top + margin.bottom)
	  .y(function(d) { return watsScale(d.wats) })
	  .curve(d3.curveCatmullRom.alpha(0.5));

	var areaMotion = d3.line()
	  .x(function(d) { return x(new Date(d.time)) })
	  // .y0(height + margin.top + margin.bottom)
	  .y(function(d) { return motionScale(d.motion) })
	  .curve(d3.curveCatmullRom.alpha(0.9));

	var svgUp = d3.select("#stacked_chart").append("svg")
			.attr("class","svg_chart")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	for (var i = 0; i < _data_array.length ; i++) {
		var currentData = _data_array[i][0];
		svgUp.append("path")
		  .datum(currentData)
		  .attr("d", areaWats)
		  .attr("class", "")
		  .attr("fill", "none")
		  .attr("stroke", function(){return colors[i]})
		  .attr("stroke-width", "2px" )
		  // .style("opacity", 0.9)
	}

	svgUp.append("g")
      .attr("class", "stroked x axis")
      .call(xAxis)


	svgUp.append("circle")
		.datum(min_max.max_wats_obj)
		.attr("cx", function(d){ return x(new Date(d.time)) } )
		.attr("cy", function(d){ return watsScale(d.wats) } )
		.attr("r", 5)
		.attr("fill", "#d19b13")

	svgUp.append("text")
		.datum(min_max.max_wats_obj)
		.attr("x", function(d){ return x(new Date(d.time)) + 10 } )
		.attr("y", function(d){ return watsScale(d.wats) - 10 } )
		.text(function(d){ return "Max: " + d.wats.toFixed(2) + " kWh" })
		.attr("fill", "#414042")

	svgUp.append("text")
		.attr("x", - 110)
		.attr("y", 30 )
		.text("CONSUMPTION")
		.attr("fill", "#414042")
		.style("font-size", 13)

	var svgDown = d3.select("#stacked_chart").append("svg")
			.attr("class","svg_chart")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom + 60)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	for (var i = 0; i < _data_array.length; i++) {
		var currentData = _data_array[i][0];
		svgDown.append("path")
		  .datum(currentData)
		  .attr("d", areaMotion)
		  .attr("class", "areaPath")
		  .attr("fill", "none")
		  .attr("stroke", function(){return colors[i]})
		  .attr("stroke-width", "2px" )
		  .on("mouseover", function(d) {})
		  .on("mouseout", function(d) {})     
	}

	svgDown.append("circle")
		.datum(min_max.max_motion_obj)
		.attr("cx", function(d){ return x(new Date(d.date)) } )
		.attr("cy", function(d){ return motionScale(d.motion) } )
		.attr("r", 5)
		.attr("fill", "#d19b13")

	svgDown.append("text")
		.datum(min_max.max_motion_obj)
		.attr("x", function(d){ return x(new Date(d.date)) + 10} )
		.attr("y", function(d){ return motionScale(d.motion) - 10 }  )
		.text(function(d){ return "Max: " + d.motion + " times"})
		.attr("fill", "#414042")

	svgDown.append("text")
		.attr("x", - 110)
		.attr("y", 30 )
		.text("MOTION")
		.attr("fill", "#414042")
		.style("font-size", 13)
}


module.exports = init;
