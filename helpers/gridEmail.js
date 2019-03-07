const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendConfirmationEmail(to, from, subject, text) {
  const msg = {
    to,
    from,
    subject,
    text,
  };
  sgMail.send(msg);
}


module.exports = sendConfirmationEmail;
