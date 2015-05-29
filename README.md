# sse-test
Node app that creates SSE connections to a server and logs messages 

## Installation
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## How it works
The app runs `$TEST_COUNT` tests with `$CLIENT_COUNT` as the maximum number of SSE clients per test.
For each test, the app picks a random number of SSE clients and a random number of messages to be sent on a (single) random channel. Each client keeps track of how many messages it's received, and calls `clientOK()` when it's received them all. `clientOK` keeps track of how many clients have called it, and prints a log when all clients have received all the messages. The messages are sent as POST requests to `$SATELLITE_URL/broadcast/channelID` with `$TOKEN`.
