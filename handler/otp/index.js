import saveOtp from '../../db/connection/mongo/auth/saveOtp';
const twilio = require('twilio');

const accountSid = 'AC13c142cc4ef2d2f65314c7157e111b0f';
const authToken = '6c22f73ee2094dac2f5f3cc6340746de';

const sendOtp = (to = '+917416634081') => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const client = new twilio(accountSid, authToken);
    return client.messages.create({
        body: `your verification code is - ${otp}`,
        to,
        from: '+12029331896'
    }).then(() => {
        saveOtp({ to, otp }).then(() => {

        }).catch(() => {

        })
    }).catch(() => {

    })
}

export default sendOtp;