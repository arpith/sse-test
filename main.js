var EventSource = require('eventsource');
var dgram  = require('dgram');
var apikey = process.env.HOSTEDGRAPHITE_APIKEY;

for(var i = 0; i < process.env.CLIENT_COUNT; i++){
  createClient(i);
}

function createClient(id) {
  var es = new EventSource(process.env.SATELLITE_URL);
  es.onmessage = function(e) {
    logSuccess(e.data);
  };
  es.onerror = function() {
    logError(id);
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
