# sse-test
Node app that creates SSE connections to a server and logs messages 

## Installation
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Usage
```
$ export CLIENT_COUNT=100
$ export SATELLITE_URL=yourServerUrl
$ export TOKEN=authTokenForSatellite
$ babel-node main.js
```

## How it works
The app runs tests with `$CLIENT_COUNT` as the maximum number of SSE clients per test.
For each test, the app picks a random number of SSE clients and a message to be sent on a random channel. If all clients receive the message, it prints `OK` (or `FAIL`). 
