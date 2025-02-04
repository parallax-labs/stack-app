#!/usr/bin/env node
const EMAIL_SERVICE = 'gmail';

const nodemailer = require('nodemailer');
const buildReleaseEmail = require('./release_email');

// Environment variables
const {
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  RELEASE_TAG,
  RELEASE_NAME,
  RELEASE_BODY,
  RECIPIENT_EMAIL
} = process.env;

const transport = {
    service: EMAIL_SERVICE,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
};

const sendCallback = (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent successfully:', info.response);
};

const email = buildReleaseEmail(RELEASE_NAME, RELEASE_TAG, RELEASE_BODY);

const transporter = nodemailer.createTransport(transport);

transporter.sendMail(email, sendCallback);
