/** Server startup for Hack-or-snooze API */
const app = require('./app');

app.listen(3000, function() {
  console.log('Listening on 3000');
});
