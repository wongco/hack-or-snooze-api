/** Server startup for Hack-or-snooze API */
const { SERVER_PORT } = require('./config');
const app = require('./app');

app.listen(SERVER_PORT, function() {
  console.log(`Listening on ${SERVER_PORT}`);
});
