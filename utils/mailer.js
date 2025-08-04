// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER || 'niravkagathara4@gmail.com',
    pass: process.env.MAIL_PASS || 'grkotcggvbdrftnv',
  },
});

exports.sendSuccessMail = async (to, token, teamName) => {
  await transporter.sendMail({
    from: '"Free Fire Tournament" <no-reply@fft.com>',
    to,
    subject: '🎟️ Team Registration Successful',
    html: `<h3>Team ${teamName} Registered!</h3><p>Your team is under verification.</p><p><b>Token:</b> ${token}</p>`,
  });
};
