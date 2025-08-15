# Example twilio api
const accountSid = 'AC30dbc33943d55061ae7ac970355e6ce1';
const authToken = '[AuthToken]';
const client = require('twilio')(accountSid, authToken);
client.messages
    .create({
        body: 'tHIS IS YOUR OTP',
        from: '+17744898917',
        to: '+917397901889'
    })
    .then(message => console.log(message.sid));