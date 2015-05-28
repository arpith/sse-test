var util = require('util');
var EventSource = require('eventsource');
var request = require('request');

for {
  var clientCount = randomClientCount();
  var messageCount = randomMessageCount(clientCount);
  var channelId = randomChannelId();
  var messagesReceived = {}
  for (var i = 0; i < clientCount; i++) {
    setTimeout(function (clientId, channelId, messageCount) {
      createClient(clientId, channelId, messageCount);
    }, i*100, i, channelId, messageCount);
  }
  for (var i = 0; i < messageCount; i++) {
    messagesReceived[i] = 0;
    request.post(process.env.SATELLITE_URL+channelId).form({'token':process.env.TOKEN, 'message':i});
  }
}

function createClient(id, channelId) {
  var es = new EventSource(process.env.SATELLITE_URL+channelId);
  es.onmessage = function(e) {
    console.log("Received: "+e.data+" ("+id+")");
  };
  es.onerror = function(e) {
    console.log("Error: "+id+" "+util.inspect(e))
  };
}

function randomChannelId() {
  return Math.random().toString();
}

function randomMessageCount(clientCount) {
  return getRandomInt(1, clientCount);
}

function randomClientCount() {
  return getRandomInt(1, process.env.CLIENT_COUNT);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
