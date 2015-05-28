# sse-test
Node app that creates SSE connections to a server and logs messages 

## Installation
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## How it works
The app creates `$CLIENT_COUNT` SSE listeners to `$SATELLITE_URL` and logs message counts to Graphite
