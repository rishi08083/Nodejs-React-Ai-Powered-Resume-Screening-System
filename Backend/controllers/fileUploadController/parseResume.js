const { generateToken } = require("../../utils/tokenGeneration");
const path = require("path");
const axios = require("axios");
const { screenCandidate } = require("../../utils/screenUtils");
const db = require("../../models");

exports.parseResumes = async (
  uploadedFiles,
  job_id,
  user_id,
  originalfiles
) => {
  try {
    const errors = [];
    const successfulUploads = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const fileName = originalfiles[i].originalname;
      let aiEndpoint;
      const fileExtension = path.extname(file.fileName).toLowerCase();

      // Determine the AI backend endpoint based on file type
      if (fileExtension === ".pdf") {
        aiEndpoint = "/parse_pdf_resume";
      } else if ([".doc", ".docx"].includes(fileExtension)) {
        aiEndpoint = "/parse_doc_resume";
      } else if ([".png", ".jpg", ".jpeg"].includes(fileExtension)) {
        aiEndpoint = "/parse_image_resume";
      } else {
        errors.push({ file: fileName, error: "Unsupported file type" });
        continue;
      }

      try {
        // Generate a token for authentication
        const token = generateToken();
        const aiResponse = await axios.post(
          `${process.env.AI_BACKEND_URL}${aiEndpoint}?file_key=${file.fileName}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Error handling for AI response
        if (
          aiResponse.status !== 200 ||
          !aiResponse.data ||
          !aiResponse.data.data
        ) {
          errors.push({
            file: fileName,
            error: "Failed to parse resume or invalid response from AI backend",
          });
          continue;
        }

        // Validate required fields in AI response
        const parsedData = aiResponse.data.data;
        if (!parsedData.email && !parsedData.phone) {
          errors.push({
            file: fileName,
            error: "Incomplete resume data: Missing email and phone number",
          });
          continue;
        }
        const isEmailExist = await db.Candidates.findOne({
          where: {
            email: parsedData.email,
            job_id,
            is_deleted: false,
            user_id,
          },
        });

        if (isEmailExist) {
          errors.push({
            file: fileName,
            error: `Candidate with email ${parsedData.email} and phone number ${parsedData.phone} already exists for the job.`,
          });
          continue;
        }

        // Save the parsed data to the database
        const candidate = await db.Candidates.create({
          name: parsedData.name ? parsedData.name : "Name Not Provided",
          email: parsedData.email ? parsedData.email : "Email Not Provided",
          phone_number: parsedData.phone
            ? parsedData.phone
            : "Phone Not Provided",
          resume_url: file.fileUrl,
          status: "parsed",
          job_id: job_id,
          user_id: user_id,
        });

        // Create an array of promises to execute concurrently
        const promises = [
          // Add parsed resume data
          candidate.createParsed_resume({
            resume_obj: parsedData,
            user_id: user_id,
            is_deleted: false,
          }),

          // Add skills if available
          ...(parsedData.skills && Array.isArray(parsedData.skills)
            ? [candidate.createSkill({ skill_names: parsedData.skills })]
            : []),

          // Add experience if available
          ...(parsedData.experience && Array.isArray(parsedData.experience)
            ? parsedData.experience.map((exp) => {
                const startDate = exp.start_date
                  ? new Date(exp.start_date)
                  : null;
                const endDate = exp.end_date ? new Date(exp.end_date) : null;
                const isValidDate = (date) =>
                  date instanceof Date && !isNaN(date);

                return candidate.createExperience({
                  company_names: exp.company || "Unknown Company",
                  job_titles: exp.job_title || "Unknown Job Title",
                  start_date: isValidDate(startDate) ? startDate : null,
                  end_date: isValidDate(endDate) ? endDate : null,
                });
              })
            : []),

          // Add education if available
          ...(parsedData.education && Array.isArray(parsedData.education)
            ? parsedData.education.map((edu) => {
                const startDate = edu.start_date
                  ? new Date(edu.start_date)
                  : null;
                const endDate = edu.end_date ? new Date(edu.end_date) : null;
                const isValidDate = (date) =>
                  date instanceof Date && !isNaN(date);

                return candidate.createEducation({
                  institution_name: edu?.College || "Unknown Institution",
                  degree: edu?.Degree || "Unknown Degree",
                  start_date: isValidDate(startDate) ? startDate : null,
                  end_date: isValidDate(endDate) ? endDate : null,
                });
              })
            : []),
        ];

        // Execute all database operations concurrently
        await Promise.all(promises);

        // Screen the candidate in the background without waiting
        screenCandidate(candidate.id).catch((err) => {
          console.error(
            `Background screening failed for candidate ${candidate.id}:`,
            err
          );
        });

        // Add the successful upload to our tracking array
        successfulUploads.push({
          fileName: fileName,
          candidateId: candidate.id,
          name: parsedData.name,
          email: parsedData.email,
          fileUrl: file.fileUrl,
        });
      } catch (error) {
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          errors.push({
            file: fileName,
            error: errorData.message || "API request failed",
            code: errorData.code || error.response.status,
          });
        } else {
          errors.push({
            file: fileName,
            error: "Network or unknown error",
            details: error.message,
          });
        }
      }
    }
    return { errors, successfulUploads };
  } catch (error) {
    console.log(`Error during parsing: ${error}`);
    return {
      errors: [{ error: "An unexpected error occurred during parsing." }],
      successfulUploads: [],
    };
  }
};
