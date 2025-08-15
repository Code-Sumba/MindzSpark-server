# Example twilio api
const accountSid = 'xxxxxxxxx';
const authToken = '[AuthToken]';
const client = require('twilio')(accountSid, authToken);
client.messages
    .create({
        body: 'tHIS IS YOUR OTP',
        from: '+xxxxxxxxx',
        to: '+917397901889'
    })
    .then(message => console.log(message.sid));