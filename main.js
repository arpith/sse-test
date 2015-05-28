var util = require('util');
var EventSource = require('eventsource');
var dgram  = require('dgram');
var apikey = process.env.HOSTEDGRAPHITE_APIKEY;


for (var i = 0; i < process.env.CLIENT_COUNT; i++) {
  var k = i;
  setTimeout(function () {
    createClient(k);
  }, i*100);
}

function createClient(id) {
  var es = new EventSource(process.env.SATELLITE_URL);
  es.onmessage = function(e) {
    console.log("Received: "+e.data+" ("+id+")");
  };
  es.onerror = function(e) {
    console.log("Error: "+id+" "+util.inspect(e))
  };
}

