const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const mime = require('mime-types');
require("dotenv").config();
const { 
  processAndUploadResume,
  extractJobTitle
} = require("../emailCrawlingController/processEmailResumes");

const crawlEmails = () => {
    // IST offset (UTC+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const now = new Date();
  const utcNow = now.getTime();
  
  // Create midnight IST for today
  const istToday = new Date(utcNow + IST_OFFSET);
  istToday.setUTCHours(0, 0, 0, 0); // Midnight in IST (using UTC methods)

  // Create midnight IST for yesterday
  const istYesterday = new Date(istToday);
  istYesterday.setUTCDate(istToday.getUTCDate() - 1);
  
  // Convert IST times to UTC
  const utcSince = new Date(istYesterday.getTime() - IST_OFFSET);
  const utcBefore = new Date(istToday.getTime() - IST_OFFSET);

  // const sinceDate = new Date(2025, 3, 11);
  // const beforeDate = new Date(2025, 3, 12);
  // console.log(sinceDate);
  // console.log(beforeDate);

  // Search criteria: 'SINCE' and 'BEFORE'
  const searchCriteria = [
    ['SINCE', utcSince], 
    ['BEFORE', utcBefore],
    // ['FROM', 'vidjanainesh@gmail.com']
    // ['X-GM-LABELS', 'PRIMARY']
  ];

  // Logs
  console.log("Searching from (UTC):", utcSince);
  console.log("Searching before (UTC):", utcBefore);
  console.log("Searching from (IST):", istYesterday.toString());
  console.log("Searching before (IST):", istToday.toString());

  const imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  });

  imap.once("error", function (err) {
    console.error("IMAP Error:", err);
  });

  imap.once("ready", function () {
    imap.openBox("INBOX", false, function (err, box) {
      if (err) {
        console.error("Error opening inbox:", err);
        return imap.end();
      }

      imap.search(searchCriteria, function (err, results) {
      // imap.search(['UNSEEN'], function (err, results) {
      // imap.search([['FROM', 'vidjanainesh@gmail.com']], function (err, results) {
        if (err || !results || !results.length) {
          console.log("No emails found.");
          imap.end();
          return;
        }

        console.log("Email UIDs found:", results);

        const f = imap.fetch(results, { bodies: "", struct: true });

        f.on("message", function (msg) {
          msg.on("body", function (stream) {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error("Mail parsing error:", err);
                return;
              }

              const jobId = await extractJobTitle(parsed);
              console.log("Job: ",jobId);

              const attachments = parsed.attachments || [];
              for (let file of attachments) {
                const ext = file.filename?.split('.').pop()?.toLowerCase();
                if (["pdf", "docx", "jpg", "jpeg", "png"].includes(ext)) {
                  try {
                    // console.log("Inside Controller: ",file);
                    await processAndUploadResume(file, jobId, 23); 
                    
                    console.log(`Processed and uploaded: ${file.filename}`);
                  } catch (uploadErr) {
                    console.error(`Failed to process ${file.filename}:`, uploadErr);
                  }
                }
              }
            });
          });
        });

        f.once("end", function () {
          console.log("Done fetching all messages.");
          imap.end();
        });
      });
    });
  });

  imap.connect();
}

module.exports = {
  crawlEmails
};