var EventSource = require('eventsource');

for(var i = 0; i < process.env.CLIENT_COUNT; i++){
  createClient(i);
}

function createClient(id) {
  var es = new EventSource(process.env.SATELLITE_URL);
  es.onmessage = function(e) {
    console.log(id+': '+e.data);
  };
  es.onerror = function() {
    console.log(id+': ERROR');
  };
}
