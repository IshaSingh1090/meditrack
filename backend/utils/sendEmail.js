const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendExpiryAlert = async (to, medicines) => {
  const list = medicines.map(m => 
    `${m.name} — expires on ${new Date(m.expiryDate).toDateString()}`
  ).join('\n');

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: '⚠️ MediTrack Pro — Medicine Expiry Alert',
    text: `The following medicines are expiring soon:\n\n${list}`
  });
};

module.exports = sendExpiryAlert;