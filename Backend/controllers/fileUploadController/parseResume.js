const { generateToken } = require("../../utils/tokenGeneration");
const path = require("path");
const axios = require("axios");
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
        if (!parsedData.name || !parsedData.email || !parsedData.phone) {
          errors.push({
            file: fileName,
            error: "Incomplete parsed data from AI backend",
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
          name: parsedData.name ? parsedData.name : "Unknown Name",
          email: parsedData.email ? parsedData.email : "Unknown Email",
          phone_number: parsedData.phone ? parsedData.phone : "Unknown Phone",
          resume_url: file.fileUrl,
          status: "parsed",
          job_id: job_id,
          user_id: user_id,
        });

        await candidate.createParsed_resume({
          resume_obj: parsedData,
          user_id: user_id,
          is_deleted: false,
        });

        if (parsedData.skills && Array.isArray(parsedData.skills)) {
          await candidate.createSkill({
            skill_names: parsedData.skills,
          });
        }

        if (parsedData.experience && Array.isArray(parsedData.experience)) {
          for (let exp of parsedData.experience) {
            const startDate = exp.start_date ? new Date(exp.start_date) : null;
            const endDate = exp.end_date ? new Date(exp.end_date) : null;
            const isValidDate = (date) => date instanceof Date && !isNaN(date);

            await candidate.createExperience({
              company_names: exp.company || "Unknown Company",
              job_titles: exp.job_title || "Unknown Job Title",
              start_date: isValidDate(startDate) ? startDate : null,
              end_date: isValidDate(endDate) ? endDate : null,
            });
          }
        }

        if (parsedData.education && Array.isArray(parsedData.education)) {
          for (let edu of parsedData.education) {
            
            const startDate = edu.start_date ? new Date(edu.start_date) : null;
            const endDate = edu.end_date ? new Date(edu.end_date) : null;
            const isValidDate = (date) => date instanceof Date && !isNaN(date);

            await candidate.createEducation({
              institution_name: edu?.College || "Unknown Institution",
              degree: edu?.Degree || "Unknown Degree",
              start_date: isValidDate(startDate) ? startDate : null,
              end_date: isValidDate(endDate) ? endDate : null,
            });
          }
        }

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
