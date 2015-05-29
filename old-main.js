var util = require('util');
var EventSource = require('eventsource');
var request = require('request');
var maxClientCount = process.env.CLIENT_COUNT;
var maxTests = process.env.TEST_COUNT;
var token = process.env.TOKEN;
var satelliteUrl = process.env.SATELLITE_URL + '/broadcast/';
var testId = 0;
var maxTests = 1;
while(testId<maxTests) {
  testId++;
  var clientCount = randomClientCount();
  var messageCount = randomMessageCount(clientCount);
  var channelId = randomChannelId();
  console.log("Test "+testId+": "+clientCount+" clients listening for "+messageCount+" messages on "+channelId);
  var clientOkCount = 0;

  var clientOK = function() {
    clientOkCount++;
    if (clientOkCount == clientCount) {
      console.log("Test "+testId+" success: "+clientCount+" clients, "+messageCount+" messages on "+channelId);
    }
  }

  for (var clientId = 0; clientId < clientCount; clientId++) {
    setTimeout(function (testId, clientId, channelId, messageCount, clientOK) {
      createClient(testId, clientId, channelId, messageCount, clientOK);
    }, i*100, testId, clientId, channelId, messageCount, clientOK);
  }

  for (var i = 0; i < messageCount; i++) {
    request.post(satelliteUrl+channelId+"?token="+token+"&message="+"hi");
  }
}

function createClient(testId, clientId, channelId, totalMessageCount, clientOK) {
  var receivedMessageCount = 0;
  var es = new EventSource(satelliteUrl+channelId);
  es.onmessage = function(e) {
    receivedMessageCount++;
    if (receivedMessageCount == totalMessageCount) clientOK();
  };
  es.onerror = function(e) {
    console.log("Test "+testId+": Client "+clientId+" received error on channel "+channelId+" after "+receivedMessageCount+" messages - "+util.inspect(e))
  };
}

function randomChannelId() {
  var crypto = require('crypto')
  , shasum = crypto.createHash('sha1');
  shasum.update(Math.random().toString());
  return shasum.digest('hex');
}

function randomMessageCount(clientCount) {
  return getRandomInt(1, clientCount);
}

function randomClientCount() {
  return getRandomInt(1, maxClientCount);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
