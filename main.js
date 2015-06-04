var util = require('util');
var EventSource = require('eventsource');
var request = require('request');

var maxClientCount = process.env.CLIENT_COUNT;
var token = process.env.TOKEN;
var satelliteUrl = process.env.SATELLITE_URL + '/broadcast';


class Client {
  constructor(url) {
  	this.es = new EventSource(url);
  }
  receiveMessage(message) {
  	return new Promise((resolve, reject) => {
  		this.es.onmessage = (m => {if (m.data == message) resolve();});
  	})
  }
  close() {
    this.es.close();
  }
}

var randomString = function() {
  var crypto = require('crypto')
    , shasum = crypto.createHash('sha1');
   shasum.update(Math.random().toString());
  return shasum.digest('hex');
}

var randomClientCount = function() {
  return getRandomInt(1, maxClientCount);
}

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var startTest = function () {
  var msg = "PONG";
  var channelUrl = satelliteUrl+'/'+randomString();
  var clientCount = randomClientCount();
  var clients = [];
  for (let i=0; i<clientCount; i++) {
    clients.push(new Client(channelUrl));
  }
  Promise.all(clients.map(c => c.receiveMessage(msg)))
  .then(function(response) {
  	console.log("WORKS for "+clientCount+" clients");
  	clients.map(c => c.close());
  }, function(error) {
  	console.log("FAIL for "+clientCount+" clients");
  	clients.map(c => c.close());
  });
  request.post(channelUrl).form({'token':token,'message':msg})
}

setInterval(function(){startTest()}, 1000);
