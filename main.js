var deferred = require('simply-deferred');

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var EventSource = require('eventsource');
var request = require('request');
var maxClientCount = process.env.CLIENT_COUNT;
var token = process.env.TOKEN;
var url = process.env.SATELLITE_URL + '/broadcast';


class Client {
  constructor(url) {
    this.url = url;
    this.es = new EventSource(url);
    this.emitter = new EventEmitter();
    this.es.onmessage = (e => this.emitter.emit('message', e.data));
    this.loader = new deferred.Deferred();
    this.es.onopen = (e => this.loader.resolve());
    this.es.onerror = (e => console.log(util.inspect(e)));
  }
  waitOn(expectedMessage, timeout) {
    var promise = new deferred.Deferred();
    this.emitter.on('message', function (msg) {
      if (msg === expectedMessage)
        promise.resolve();
    });
    setTimeout(function(){promise.reject();},timeout);
    return promise.promise();
  }
  close() {
    this.es.close();
  }

}

var randomChannelId = function() {
  var crypto = require('crypto')
    , shasum = crypto.createHash('sha1');
   shasum.update(Math.random().toString());
  return shasum.digest('hex');
}

var randomMessageCount = function(clientCount) {
  return getRandomInt(1, clientCount);
}

var randomClientCount = function() {
  return getRandomInt(1, maxClientCount);
}

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var startTest = function () {
  var channelUrl = url+'/'+randomChannelId();
  var clientCount = randomClientCount();
  var clients = []
  for (let i=0; i<clientCount; i++) {
    clients.push(new Client(channelUrl));
  }
  var msg = randomChannelId();
  var clientLoaders = clients.map(c => c.loader);
  deferred.when(clientLoaders).done(function() {
    var clientPromises = clients.map(c => c.waitOn(msg,5000));
    deferred.when(clientPromises).done(function() {clients.map(c => c.close()); console.log("Works for message "+msg+" count "+clientCount);});
    deferred.when(clientPromises).fail(function() {clients.map(c => c.close()); console.log("Fail for message "+msg+" count "+clientCount);});
    request.post(channelUrl).form({'token':token,'message':msg});
  });
}
setInterval(function(){startTest()}, 1000);
