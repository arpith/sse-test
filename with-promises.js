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
    this.es = new EventSource(url);
    this.emitter = new EventEmitter();
    this.loader = new deferred.Deferred();
    var loader = this.loader;
    this.es.onopen = function(){ loader.resolve()};
    this.es.onerror = (e => console.log(util.inspect(e)));
    this.es.onmessage = (e => loader.resolve() && this.emitter.emit('message', e.data));
  }
  waitOn(expectedMessage, timeout) {
    var promise = new deferred.Deferred();
    this.emitter.on('message', function (msg) {
      if (msg === 'PONG')
        promise.resolve();
    });
    setTimeout(function(){promise.reject();},timeout);
    return promise.promise();
  }
  close() {
//    this.es.close();
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
  var channelUrl = satelliteUrl+'/'+randomChannelId();
  var clientCount = randomClientCount();
  var clients = []
  for (let i=0; i<clientCount; i++) {
    clients.push(new Client(channelUrl));
  }
  var msg = randomChannelId();
  var clientLoaders = clients.map(c => c.loader);
  deferred.when(clientLoaders).done(function() {
    var clientPromises = clients.map(c => c.waitOn(msg,20000));
    deferred.when(clientPromises).done(function() {clients.map(c => c.close()); console.log("Works for message "+msg+" count "+clientCount);});
    deferred.when(clientPromises).fail(function() {clients.map(c => c.close()); console.log("Fail for message "+msg+" count "+clientCount);});
    request.post(channelUrl).form({'token':token,'message':msg});
  });
}
setInterval(function(){startTest()}, 5000);
