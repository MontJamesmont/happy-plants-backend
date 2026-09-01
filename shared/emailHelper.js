const path = require('path');
const process = require('process');
const {google} = require('googleapis');
const {createMimeMessage} = require('mimetext')
const Secret = require("../models/Secret");

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const googleapisAuthorize = async () => {
  const authClient = new google.auth.JWT({
    keyFile: CREDENTIALS_PATH,
    scopes: [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
      'https://mail.google.com',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    subject: 'office@ejsmontscript.com' // google admin email address to impersonate
  });

  await authClient.authorize();

  return authClient;
}

const sendEmail = async (to, subject, html) => {
  const client = await googleapisAuthorize();
  const gmail = google.gmail({version: 'v1', auth: client});
  const senderEmailObj = await Secret.findOne({
    name: "email"
  })
  const senderEmail = senderEmailObj ? senderEmailObj.value : null
  const msg = createMimeMessage()
  msg.setSender(senderEmail)
  msg.setRecipient(to)
  msg.setSubject(subject)
  msg.addMessage({
      contentType: 'text/html',
      data: html
  })

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: msg.asEncoded()
    }
  });
  const responseData = res.data;
  console.log('payload: ', res.data);

  if (!responseData) {
    console.log('Email not sent.');
    return;
  }
}

module.exports = {
  googleapisAuthorize,
  sendEmail
}