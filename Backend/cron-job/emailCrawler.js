const cron = require('node-cron');
const { crawlEmails } = require('../controllers/emailCrawlingController'); // Import the function to connect to IMAP and fetch emails

// Schedule the task to run every day at 6:00 AM IST
cron.schedule('0 6 * * *', function() {
  // console.log("Starting email crawl for yesterday at 6 AM IST...");
  
  // Call the email crawling function
  crawlEmails();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Set the timezone to IST
});