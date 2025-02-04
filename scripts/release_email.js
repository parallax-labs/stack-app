// Email subject
const subject = (RELEASE_NAME, RELEASE_TAG, RELEASE_BODY) => `New Release: ${RELEASE_NAME} (${RELEASE_TAG})`;

// HTML email template
const htmlContent = (RELEASE_NAME, RELEASE_TAG, RELEASE_BODY) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      width: 80%;
      margin: 0 auto;
    }
    .header {
      background-color: #f8f9fa;
      padding: 10px;
      border-bottom: 2px solid #007bff;
      text-align: center;
    }
    .content {
      margin: 20px 0;
    }
    .release-notes {
      background-color: #f1f1f1;
      padding: 15px;
      border-radius: 5px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 20px;
      font-size: 0.9em;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Release Published: ${RELEASE_NAME} (${RELEASE_TAG})</h2>
    </div>
    <div class="content">
      <p>Dear Team,</p>
      <p>We are excited to announce that a new version of our Chrome extension has been released.</p>
      <div class="release-notes">
        <h3>Release Notes:</h3>
        <p>${RELEASE_BODY}</p>
      </div>
      <p>For more details, visit the <a href="https://github.com/your-repo/releases/tag/${RELEASE_TAG}">release page</a>.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>Parker Jones</p>
    </div>
  </div>
</body>
</html>
`;

// Plain text version of the email
const textContent = (RELEASE_NAME, RELEASE_TAG, RELEASE_BODY) => `
New Release Published: ${RELEASE_NAME} (${RELEASE_TAG})

Dear Team,

We are excited to announce that a new version of our Chrome extension has been released.

Release Notes:
${RELEASE_BODY}

For more details, visit the release page: https://github.com/parallax-labs/stack-app/releases/tag/${RELEASE_TAG}

Best regards,
Parker Jones
`;

const from = (name, address) => `${name} <${address}>`;

// Email options
export default (RELEASE_NAME, RELEASE_TAG, RELEASE_BODY) => ({
  from: from("Parker Jones", "parker.emailaddress@gmail.com"),
  to: "stack-testers@googlegroups.com",
  subject: subject(RELEASE_NAME, RELEASE_TAG, RELEASE_BODY),
  text: textContent(RELEASE_NAME, RELEASE_TAG, RELEASE_BODY),
  html: htmlContent(RELEASE_NAME, RELEASE_TAG, RELEASE_BODY),
});