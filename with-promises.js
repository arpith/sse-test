var deferred = require('simply-deferred');

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var EventSource = require('eventsource');
var request = require('request');
var maxClientCount = process.env.CLIENT_COUNT;
var token = process.env.TOKEN;
var satelliteUrl = process.env.SATELLITE_URL + '/broadcast';


class Client {
  constructor(url) {
    this.url = url;
  }
	addES() {
		return new Promise(function(resolve, reject) {
			this.es = new EventSource(this.url);
			this.es.onopen = resolve;
			this.es.onerror = reject;
		})
	}
	receiveMessage() {
		return new Promise(function(resolve, reject) {
			this.es.onerror = reject;
			this.es.onmessage = resolve;
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
  var msg = randomString();
  var channelUrl = satelliteUrl+'/'+randomString();
  var clientCount = randomClientCount();
	var postMessage = function() {
		return new Promise(function(resolve, reject) {
			request
				.post(channelUrl)
				.form({'token':token,'message':msg})
			  .on('error', reject)
				.on('response', resolve);
		});
	}
  var clients = [];
  for (let i=0; i<clientCount; i++) {
    clients.push(new Client(channelUrl));
  }
	Promise.all(clients.map(c => c.addEs))
		.then(function(arrayOfResults) {console.log(util.inspect(arrayOfResults));})
		.catch(function(arrayOfErrors) {console.log(util.inspect(arrayOfErrors));});
}
setInterval(function(){startTest()}, 5000);
