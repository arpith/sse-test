var util = require('util');
var EventSource = require('eventsource');
var dgram  = require('dgram');
var apikey = process.env.HOSTEDGRAPHITE_APIKEY;

var clients = []
for(var i = 0; i < process.env.CLIENT_COUNT; i++){
  var k = i;
  clients[i] = 0;
  setTimeout(function () {
    createClient(k);
  }, i*100);
}

function createClient(id) {
  var es = new EventSource(process.env.SATELLITE_URL);
  es.onmessage = function(e) {
    clients[id]++;
    console.log(util.inspect(clients));
    console.log("Received: "+e.data+" ("+id+")");
//    logSuccess(e.data);
  };
  es.onerror = function(e) {
    console.log("Error: "+id+" "+util.inspect(e))
//    logError(id);
  };
}

function logSuccess(data) {
  var message = new Buffer(apikey + "."+data+".success 1\n");
  var client = dgram.createSocket("udp4");
  client.send(message, 0, message.length, 2003, "carbon.hostedgraphite.com", function(err, bytes) {
    client.close();
  });
}

function logError(id) {
  var message = new Buffer(apikey + ".errors."+id+" 1\n");
  var client = dgram.createSocket("udp4");
  client.send(message, 0, message.length, 2003, "carbon.hostedgraphite.com", function(err, bytes) {
    client.close();
  });
}
