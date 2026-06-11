const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const sendExpiryAlert = require('./sendEmail');

const startScheduler = () => {
  // Runs every day at 8am
  cron.schedule('0 8 * * *', async () => {
    console.log('Running expiry check...');
    const today = new Date();
    const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringSoon = await Medicine.find({
      expiryDate: { $lte: in7days },
      expiryStatus: { $ne: 'expired' }
    }).populate('user', 'email name');

    // Group by user
    const userMap = {};
    expiringSoon.forEach(med => {
      const email = med.user.email;
      if (!userMap[email]) userMap[email] = [];
      userMap[email].push(med);
    });

    // Send email to each user
    for (const [email, meds] of Object.entries(userMap)) {
      await sendExpiryAlert(email, meds);
      console.log(`Alert sent to ${email}`);
    }
  });
};

module.exports = startScheduler;