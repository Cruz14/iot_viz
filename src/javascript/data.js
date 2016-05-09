
var lightChart = require('./light_chart');
var stackedChart = require('./stacked_chart.js');
var d3_request = require('d3-request');
_ = require('lodash');

var lightURL9H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20MEAN(brightness)%20AS%20brightness%2C%20MEAN(power)%20AS%20power%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%209h%20GROUP%20BY%20time(15m)%2C%20sensorId%20FILL(previous)&precision=ms';
var motionURL9H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20COUNT(DISTINCT(motion))%20%20AS%20motion%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%209h%20GROUP%20BY%20time(15m)%2C%20sensorId%20%20FILL(none)&precision=ms';

var lightURL24H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20MEAN(brightness)%20AS%20brightness%2C%20MEAN(power)%20AS%20power%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%2024h%20GROUP%20BY%20time(1h)%2C%20sensorId%20FILL(previous)&precision=ms'

var motionURL24H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20COUNT(DISTINCT(motion))%20%20AS%20motion%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%2024h%20GROUP%20BY%20time(1h)%2C%20sensorId%20%20FILL(none)&precision=ms';

var lightURL72H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20MEAN(brightness)%20AS%20brightness%2C%20MEAN(power)%20AS%20power%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%2072h%20GROUP%20BY%20time(3h)%2C%20sensorId%20FILL(previous)&precision=ms'

var motionURL72H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20COUNT(DISTINCT(motion))%20%20AS%20motion%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%2072h%20GROUP%20BY%20time(3h)%2C%20sensorId%20%20FILL(none)&precision=ms';

var lightURL120H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20MEAN(brightness)%20AS%20brightness%2C%20MEAN(power)%20AS%20power%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%20120h%20GROUP%20BY%20time(6h)%2C%20sensorId%20FILL(previous)&precision=ms'

var motionURL120H = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20COUNT(DISTINCT(motion))%20%20AS%20motion%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%20120h%20GROUP%20BY%20time(6h)%2C%20sensorId%20%20FILL(none)&precision=ms';

var lightURL1M = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20MEAN(brightness)%20AS%20brightness%2C%20MEAN(power)%20AS%20power%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%204w%20GROUP%20BY%20time(24h)%2C%20sensorId%20FILL(previous)&precision=ms'

var motionURL1M = 'http://influxdb02.prd.aws.smartvenue.io:8086/query?db=svdata&q=SELECT%20COUNT(DISTINCT(motion))%20%20AS%20motion%20FROM%20%22location-feed%22%20WHERE%20time%20%3E%20now()%20-%204w%20GROUP%20BY%20time(24h)%2C%20sensorId%20%20FILL(none)&precision=ms';

var lightReady = false;
var motionReady = false;
var newArrMotion = [];
var newArrLight = [];
var max_min = {
	min_wats:0,
	max_wats:0,
	max_wats_obj:{},
	min_motion:0,
	max_motion:0,
	max_motion_obj:{},
	sum_wats:0,
	mean_brightness:0
};
// 
var minMotionValue = 0;
var maxMotionValue = 0;
// 
var minWatsValue = 0;
var maxWatsValue = 0;
var sumWatsValue = 0;
var meanBrigValue = 0;

var currentQuery= "";
var firstQuery = false;

function queryLight(url){
	lightReady = false;
	d3_request.request(url)
		.header("Authorization", "Basic dm9sdGVvZGVtbzp2azE2ZDNtMA==")
		.mimeType("application/json")
		.response(function(xhr) { return JSON.parse(xhr.responseText); })
		.on("error", function(error) { callback(error); })
		.get(calbackLight);
}

var calbackLight = function(XMLResult){
	newArrLight = [];
	var values = XMLResult.results[0].series;
	var result = [];
	for (var i = 0; i < values.length; i++) {
		var newObj = {
			type: 'location-feed',
			sensorId: values[i].tags.sensorId,
			values:values[i].values,
		}
		result.push(newObj);
	}
	for (var i = 1; i < result.length; i++) {
      var type = result[i].type;
      var sensorId = result[i].sensorId;
      var num = i;
      for (var t = 0; t < result[i].values.length; t++) {
      	if (result[i].values[t][2] == null) {
      		result[i].values[t][2] = 0;
      	}
      	if (result[i].values[t][1] == null) {
      		result[i].values[t][1] = 0;
      	}
        var obj = {
          time:result[i].values[t][0],
          timeDate: new Date(result[i].values[t][0]),
          brightness: result[i].values[t][1],
          wats: result[i].values[t][2],
          type: type,
          sensorId: sensorId,
          sensorNum:num
        }
        newArrLight.push(obj);
      }
   }
	var minObjWats = _.minBy(newArrLight, function(o) { return o.wats; })
	minWatsValue = minObjWats.wats;
	var maxObjWats = _.maxBy(newArrLight, function(o) { return o.wats; })
	maxWatsValue = maxObjWats.wats;
	var sumObjWats = Math.round( _.sumBy(newArrLight, function(o) { return o.wats; }));
	var meanObjBrig = Math.round( _.meanBy(newArrLight, function(o) { return o.brightness; }));
	max_min.min_wats = minWatsValue;
	max_min.max_wats = maxWatsValue;
	max_min.max_wats_obj = maxObjWats;
	max_min.sum_wats = sumObjWats;
	max_min.mean_brightness = meanObjBrig;
	lightReady = true;
	run();
}

function queryMotion(url){
	motionReady = false;
	d3_request.request(url)
		.header("Authorization", "Basic dm9sdGVvZGVtbzp2azE2ZDNtMA==")
		.mimeType("application/json")
		.response(function(xhr) { return JSON.parse(xhr.responseText); })
		.on("error", function(error) { callback(error); })
		.get(calbackMotion);
}

var calbackMotion = function(XMLResult){
	newArrMotion = [];
	var values = XMLResult.results[0].series;
	var result = [];
	for (var i = 0; i < values.length; i++) {
		var newObj = {
			type: 'location-feed',
			sensorId: values[i].tags.sensorId,
			values:values[i].values,
		}
		result.push(newObj);
	}

	for (var i = 3; i < result.length; i++) {
		var type = result[i].type;
		var sensorId = result[i].sensorId;
		var num = i - 3;
		for (var t = 0; t < result[i].values.length; t++) {
			var obj = {
				date:result[i].values[t][0],
				motion: result[i].values[t][1],
				type: type,
				sensorId: sensorId,
				sensorNum:num
			}
			newArrMotion.push(obj);
		}
	}
	var minObjMotion = _.minBy(newArrMotion, function(o) { return o.motion; })
	minMotionValue = minObjMotion.motion;
	var maxObjMotion = _.maxBy(newArrMotion, function(o) { return o.motion; })
	maxMotionValue = maxObjMotion.motion;
	max_min.min_motion = minMotionValue;
	max_min.max_motion = maxMotionValue;
	max_min.max_motion_obj = maxObjMotion;
	motionReady = true;
	run();
}

function run(){
  if (lightReady && motionReady) {
    var grupData = [];
    for (var i = 0; i < newArrMotion.length; i++) {
      newArrLight[i].motion = newArrMotion[i].motion;
    }
    lightChart.init(currentQuery,newArrLight,max_min,firstQuery);
    stackedChart(currentQuery,newArrLight,max_min,firstQuery)
  }
}

var influx = require('influx');

var client = influx({
  host: 'influxdb02.prd.aws.smartvenue.io',
  port: 8086,
  username: 'volteodba',
  password: 'V0lt301nflux',
  database: 'svdata'
});

function queryLightInflux(){
	client.query('SELECT MEAN(brightness) AS brightness, MEAN(power) AS power FROM "location-feed" WHERE time > now() - 24h GROUP BY time(1h), sensorId FILL(previous)', function (error, results) {
		if(error) {console.log(error)};
	});
}

function queryMotionInflux(){
	client.query('SELECT COUNT(DISTINCT(motion))  AS motion FROM "location-feed" WHERE time > now() - 72h GROUP BY time(3h), sensorId  FILL(none)', function (error, results) {
		if(error) {console.log(error)}
	});
}


var _9hQuery = function(first) {
	firstQuery = first;
	currentQuery = "last 9 hours";
	queryLight(lightURL9H);
	queryMotion(motionURL9H);
}

var _1dQuery = function(first) {
	firstQuery = first;
	currentQuery = "last 24 hours";
	queryLight(lightURL24H);
	queryMotion(motionURL24H);
}

var _3dQuery = function(first) {
	firstQuery = first;
	currentQuery = "last 3 days";
	queryLight(lightURL72H);
	queryMotion(motionURL72H);
}

var _5dQuery = function(first) {
	firstQuery = first;
	currentQuery = "last 5 days";
	queryLight(lightURL120H);
	queryMotion(motionURL120H);
}

var _1mQuery = function(first) {
	firstQuery = first;
	currentQuery = "last month";
	queryLight(lightURL1M);
	queryMotion(motionURL1M);
}

var querys = {
	_9hQuery: _9hQuery,
	_1dQuery:_1dQuery,
	_3dQuery:_3dQuery,
	_5dQuery:_5dQuery,
	_1mQuery: _1mQuery
}

module.exports = querys;
