#! /usr/bin/env node

const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const to = 'parker.emailaddress@gmail.com';
const from = 'noreply@stack-app.cloud';
const RELEASE_TAG = process.env.RELEASE_TAG || '';
const RELEASE_NAME = process.env.RELEASE_NAME || '';
const RELEASE_BODY = process.env.RELEASE_BODY || '';
const subject = 'New Release: ' + RELEASE_TAG;
const text = 'A new release has been published.\n\n' +
          'Release Tag: ' + RELEASE_TAG + '\n' +
          'Release Name: ' + RELEASE_NAME + '\n\n' +
          'Release Notes:\n' + RELEASE_BODY;

const html = '<p>A new release has been published.</p>' +
          '<p><strong>Release Tag:</strong> ' + RELEASE_TAG + '</p>' +
          '<p><strong>Release Name:</strong> ' + RELEASE_NAME + '</p>' +
          '<p><strong>Release Notes:</strong></p>' +
          '<p>' + RELEASE_BODY.replace(/\n/g, '<br>') + '</p>';

sgMail.setApiKey(SENDGRID_API_KEY);

const msg = {
    to, // Replace with your recipient's email address
    from,  // Replace with your authenticated sender email
    subject,
    text,
    html,
};

sgMail
    .send(msg)
    .then(() => console.log('Mail sent successfully'))
    .catch(error => console.error(error.toString()));
