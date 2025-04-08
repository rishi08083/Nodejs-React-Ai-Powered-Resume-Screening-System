const cron = require('node-cron');
const { mailRecruiter } = require('../controllers/mailRecruiterController');
const db = require('../models');

const fakeRes = {
  status: () => ({
    json: () => {}
  }),
};

// Schedule: Every day at 9:00 AM server time
cron.schedule('0 9 * * 1', async () => {
  // console.log('Triggering weekly recruiter emails (every Monday at 9AM)...');

  try {
    const recruiters = await db.Users.findAll({
      where: { role: 'recruiter' },
    });

    for (const recruiter of recruiters) {
      const fakeReq = {
        user: {
          user: recruiter
        }
      };

      await mailRecruiter(fakeReq, fakeRes);
      // console.log(`Sent email to recruiter: ${recruiter.email}`);
    }

    // console.log('All recruiter emails sent successfully.');

  } catch (err) {
    console.error('Error sending recruiter emails:', err);
  }
}, {
  timezone: 'Asia/Kolkata'
});