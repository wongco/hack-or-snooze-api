/** requires for Twilio */
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_NUMBER
} = require('../config');

const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);

/** Send message as SMS */
async function sendSmsMessage(targetNumber, message) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: `+${TWILIO_NUMBER}`,
      to: `+${targetNumber}`
    });

    console.log('SMS Recovery Message Sent.');
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
}

module.exports = sendSmsMessage;
