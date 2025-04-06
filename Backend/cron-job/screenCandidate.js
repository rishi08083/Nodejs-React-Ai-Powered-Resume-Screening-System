const cron = require("node-cron");
const db = require("../models");
const axios = require("axios");
const { generateToken } = require("../utils/tokenGeneration");
const { getCandidateDetails, saveScreeningResult } = require("../utils/screenUtils");

// Helper: Sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Flag to track if a screening is in progress
let isScreeningInProgress = false;

// Screening logic for one candidate
async function screenCandidate(candidate) {
  try {
    const candidate_id = candidate.id;
    // console.log(`📝 Starting screening for candidate ${candidate_id}`);
    
    const candidateDetails = await getCandidateDetails(candidate_id);
    const token = generateToken();

    const aiResponse = await axios.post(
      `${process.env.AI_BACKEND_URL}/screen_candidates_2`,
      {
        jd: candidateDetails.jd,
        rcd_file_key: candidateDetails.rcd_file_key,
        candidate: candidateDetails.candidate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payload = {
      candidate_id,
      job_id: candidateDetails.jd.job_id,
      user_id: candidateDetails.user_id,
      match_score: aiResponse.data.Combined_Score,
      status_of: aiResponse.data.status === "success",
      missing_skills: aiResponse.data.missing_skills || [],
      is_deleted: false,
      feedback_json: aiResponse.data,
    };

    const existing = await db.ScreeningResults.findOne({ where: { candidate_id } });

    if (existing) {
      await existing.update(payload);
    } else {
      await saveScreeningResult(payload);
    }

    await db.Candidates.update({ is_screened: true }, { where: { id: candidate_id } });

    // console.log(`✅ Candidate ${candidate_id} screened successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Error screening ${candidate.id}:`, err.message);
    return false;
  }
}

// Process candidates one at a time, with 6-second interval
async function processQueue() {
  if (isScreeningInProgress) {
    return;
  }

  try {
    isScreeningInProgress = true;
    
    // Get the next unscreened candidate with a lock to prevent duplications
    const candidate = await db.sequelize.transaction(async (t) => {
      const candidate = await db.Candidates.findOne({
        where: { is_screened: false },
        order: [['createdAt', 'ASC']], // Process oldest first
        lock: true,
        transaction: t
      });
      
      if (candidate) {
        // Mark as processing to prevent duplication
        await candidate.update({ status: 'processing' }, { transaction: t });
      }
      
      return candidate;
    });

    if (!candidate) {
      // console.log("✅ No candidates to screen at this time.");
      isScreeningInProgress = false;
      return;
    }

    // Process the candidate
    await screenCandidate(candidate);
    
    // Wait 6 seconds before processing the next candidate
    await sleep(6000);
    
  } catch (error) {
    console.error("❌ Error in processing queue:", error);
  } finally {
    isScreeningInProgress = false;
  }
}

// Run the job every 6 seconds
cron.schedule("*/6 * * * * *", async () => {
  // Only attempt to process if no screening is currently happening
  if (!isScreeningInProgress) {
    await processQueue();
  }
});

// Export for testing or manual triggering
module.exports = {
  processQueue,
  screenCandidate
};
