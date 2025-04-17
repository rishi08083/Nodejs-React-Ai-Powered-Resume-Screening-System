

const cron = require("node-cron");
const db = require("../models");
const axios = require("axios");
const { generateToken } = require("../utils/tokenGeneration");
const {
  getCandidateDetails,
  saveScreeningResult,
} = require("../utils/screenUtils");
const logger = require('../utils/logger');

// Configuration with environment variable fallbacks
const config = {
  cronSchedule: process.env.SCREENING_CRON_SCHEDULE || "*/6 * * * * *",
  maxRetries: parseInt(process.env.SCREENING_MAX_RETRIES || "3", 10),
  baseDelayMs: parseInt(process.env.SCREENING_BASE_DELAY_MS || "1000", 10),
  apiTimeoutMs: parseInt(process.env.SCREENING_API_TIMEOUT_MS || "30000", 10),
  maxBackoffMs: parseInt(process.env.SCREENING_MAX_BACKOFF_MS || "60000", 10),
};


// Metrics tracking
const metrics = {
  totalProcessed: 0,
  successCount: 0,
  failureCount: 0,
  lastProcessedTime: null,
  avgProcessingTimeMs: 0,
  consecutiveFailures: 0,
};

// Helper: Sleep with exponential backoff
const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Flag to track if a screening is in progress
let isScreeningInProgress = false;

// Run the job according to the schedule
cron.schedule(config.cronSchedule, async () => {
  // Only attempt to process if no screening is currently happening
  if (!isScreeningInProgress) {
    await processQueue();
  }
});

// Process candidates one at a time
async function processQueue() {
  if (isScreeningInProgress) {
    return;
  }

  try {
    isScreeningInProgress = true;
    
    // Get the next unscreened candidate with a lock to prevent duplications
    const candidate = await db.sequelize.transaction(async (t) => {
      const candidate = await db.Candidates.findOne({
        where: { 
          is_screened: false, 
          is_deleted: false,
          // Don't retry candidates that have failed too many times
          status: { [db.Sequelize.Op.notIn]: ['failed_permanently'] } 
        },
        order: [["createdAt", "ASC"]], // Process oldest first
        lock: true,
        transaction: t,
      });

      if (candidate) {
        // Mark as processing to prevent duplication
        await candidate.update({ status: "processing" }, { transaction: t });
      }

      return candidate;
    });

    if (!candidate) {
      // No candidates to process, reset failure counter
      metrics.consecutiveFailures = 0;
      isScreeningInProgress = false;
      return;
    }

    logger.info(`Processing candidate ${candidate.id}`);
    
    const success = await screenCandidate(candidate);
    
    // Update metrics based on success
    if (success) {
      metrics.consecutiveFailures = 0;
      logger.success(`Candidate ${candidate.id} screened successfully`);
    } else {
      metrics.consecutiveFailures++;
      logger.error(`Failed to screen candidate ${candidate.id}`);
    }
    
    // Calculate backoff time based on consecutive failures
    const backoffTime = Math.min(
      config.baseDelayMs * Math.pow(2, metrics.consecutiveFailures) + 
      Math.random() * 1000, // Add some jitter
      config.maxBackoffMs
    );
    
    logger.info(`Waiting ${backoffTime}ms before next processing`);
    await sleep(backoffTime);
  } catch (error) {
    metrics.consecutiveFailures++;
    logger.error("Error in processing queue:", error);
  } finally {
    isScreeningInProgress = false;
  }
}

// Call AI endpoint with retries
async function callAiEndpoint(candidateDetails, candidateId) {
  let retries = 0;
  
  while (retries <= config.maxRetries) {
    try {
      const token = generateToken();
      
      // Validate input
      if (!candidateDetails.rcd_file_key) {
        throw new Error(`RCD file key is missing for candidate ${candidateId}`);
      }
      
      if (!candidateDetails.jd || !candidateDetails.jd.job_id) {
        throw new Error(`Job details are missing for candidate ${candidateId}`);
      }
      
      logger.info(`Calling AI endpoint for candidate ${candidateId}, attempt ${retries + 1}`);
      
      const response = await axios.post(
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
          timeout: config.apiTimeoutMs,
        }
      );
      
      return response;
    } catch (error) {
      retries++;
      
      // Don't retry certain errors
      if (error.response?.status === 400 || error.response?.status === 422) {
        logger.error(`AI API validation error for candidate ${candidateId}:`, error);
        throw error;
      }
      
      if (retries > config.maxRetries) {
        logger.error(`AI API call failed after ${config.maxRetries} attempts for candidate ${candidateId}:`, error);
        throw error;
      }
      
      // Calculate backoff for retries
      const delay = config.baseDelayMs * Math.pow(2, retries) + Math.random() * 1000;
      logger.info(`Retrying AI API call (attempt ${retries}/${config.maxRetries}) after ${delay}ms`);
      await sleep(delay);
    }
  }
}

// Screening logic for one candidate
async function screenCandidate(candidate) {
  const startTime = Date.now();
  let transaction;
  
  try {
    const candidate_id = candidate.id;
    logger.info(`Starting screening for candidate ${candidate_id}`);
    
    const candidateDetails = await getCandidateDetails(candidate_id);

    // Validate job details
    if (!candidateDetails.jd || !candidateDetails.jd.job_id) {
      logger.error(`Job details are missing for candidate ${candidate_id}`);
      await markCandidateAsFailedScreening(candidate_id, "missing_job_details");
      return false;
    }
    
    // Validate RCD file key
    if (!candidateDetails.rcd_file_key) {
      logger.error(`RCD file key is missing for candidate ${candidate_id}`);
      await markCandidateAsFailedScreening(candidate_id, "missing_rcd_file");
      return false;
    }

    // Call AI endpoint with retry logic
    const aiResponse = await callAiEndpoint(candidateDetails, candidate_id);

    if (!aiResponse.data || aiResponse.data.status !== "success") {
      logger.error(`AI returned unsuccessful response for candidate ${candidate_id}`);
      await markCandidateAsFailedScreening(candidate_id, "ai_error");
      return false;
    }

    // Safe access to response data with defaults
    const feedback = aiResponse.data.feedback || {};
    const recommendation = (feedback.recommendation || "").toUpperCase() === "YES" 
      ? "YES" 
      : "NO";
      
    const payload = {
      candidate_id,
      job_id: candidateDetails.jd.job_id,
      user_id: candidateDetails.user_id,
      match_score: aiResponse.data.combined_score || 0,
      status_of: aiResponse.data.status === "success",
      missing_skills: {
        jd_match: feedback.jd_match || [],
        rcd_match: feedback.rcd_match || [],
        jd_mismatch: feedback.jd_mismatch || [],
        rcd_mismatch: feedback.rcd_mismatch || [],
        jd_skill_match: aiResponse.data.jd_skill_match || 0,
        rcd_skill_match: aiResponse.data.rcd_skill_match || 0,
        feedback: feedback.feedback || [],
        experience_match: feedback.experience_match || false,
        experience_info: feedback.experience_info || [],
        match_score: aiResponse.data.combined_score || 0,
        is_recommended: recommendation,
      },
      is_deleted: false,
      is_recommended: recommendation,
      feedback_json: feedback,
    };

    // Database operations with transaction for consistency
    transaction = await db.sequelize.transaction();
    
    const existing = await db.ScreeningResults.findOne({
      where: { candidate_id },
      transaction,
    });

    if (existing) {
      await existing.update(payload, { transaction });
    } else {
      await saveScreeningResult(payload, transaction);
    }

    await db.Candidates.update(
      { 
        is_screened: true, 
        is_recommended: payload.is_recommended,
        status: "screened",
        updatedAt: new Date()
      },
      { 
        where: { id: candidate_id },
        transaction 
      }
    );

    await transaction.commit();
    
    // Update metrics
    metrics.totalProcessed++;
    metrics.successCount++;
    metrics.lastProcessedTime = new Date();
    
    const processingTime = Date.now() - startTime;
    metrics.avgProcessingTimeMs = 
      (metrics.avgProcessingTimeMs * (metrics.totalProcessed - 1) + processingTime) / 
      metrics.totalProcessed;
      
    logger.success(`Candidate ${candidate_id} screened successfully in ${processingTime}ms`);
    return true;
  } catch (err) {
    metrics.totalProcessed++;
    metrics.failureCount++;
    
    logger.error(`Error screening candidate ${candidate.id}:`, err);
    
    // Attempt to mark the candidate as failed
    try {
      await markCandidateAsFailedScreening(candidate.id, "unknown_error");
    } catch (updateErr) {
      logger.error(`Failed to update candidate status:`, updateErr);
    }
    
    // Rollback transaction if it exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        logger.error(`Transaction rollback failed:`, rollbackErr);
      }
    }
    
    return false;
  }
}

// Helper to mark a candidate as having failed screening
async function markCandidateAsFailedScreening(candidateId, reason) {
  try {
    const candidate = await db.Candidates.findByPk(candidateId);
    
    // Increment failure count
    const failureCount = (candidate.failure_count || 0) + 1;
    const status = failureCount >= 3 ? "failed_permanently" : "failed";
    
    await db.Candidates.update(
      { 
        status,
        failure_count: failureCount,
        failure_reason: reason,
        updatedAt: new Date()
      },
      { where: { id: candidateId } }
    );
    
    logger.info(`Candidate ${candidateId} marked as ${status} (attempt ${failureCount})`);
    return true;
  } catch (error) {
    logger.error(`Failed to update candidate ${candidateId} failure status:`, error);
    return false;
  }
}

// Get metrics for monitoring
function getMetrics() {
  return {
    ...metrics,
    successRate: metrics.totalProcessed > 0 
      ? (metrics.successCount / metrics.totalProcessed) * 100 
      : 0,
    currentTime: new Date()
  };
}

// Export for testing or manual triggering
module.exports = {
  processQueue,
  screenCandidate,
  getMetrics,
};