const db = require("../../models");

//Fetch jobs
exports.fetchJobs = async (req, res) => {
  try {
    const response = await fetch(""); //Insert API here between "";
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs`);
    }

    const jobsData = await response.json();

    jobsData.map(async (curr) => {
      await db.Jobs.create({
        title: curr.title,
        description: curr.description,
        location: curr.location,
        experience_required: curr.experience_required,
        job_type: curr.job_type,
        openings: curr.openings,
        company_name: curr.company_name,
        skills_required: curr.skills_required,
        contact_info: curr.contact_info,
        salary_range: curr.salary_range,
        application_deadline: curr.application_deadline,
      });
    });

    res.status(201).json({
      status: "success",
      message: "Jobs stored successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error while fetching job",
      error: { details: error.message },
    });
  }
};

// Create jobs
exports.createJobs = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      experience_required,
      job_type,
      openings,
      company_name,
      skills_required,
      contact_info,
      salary_range,
      application_deadline,
    } = req.body;

    const jobs = await db.Jobs.create({
      title,
      description,
      location,
      experience_required,
      job_type,
      openings,
      company_name,
      skills_required,
      contact_info,
      salary_range,
      application_deadline,
    });
    res.status(201).json({
      status: "success",
      message: "Jobs created successfully",
      data: jobs,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Error while creating job",
      error: { details: error.message },
    });
  }
};

// Get All jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await db.Jobs.findAll({
      attributes: [
        "id",
        "title",
        "experience_required",
        "openings",
        "is_rcd_uploaded",
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({
      status: "success",
      message: "Jobs retrieved successfully",
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve job",
      error: { details: error.message },
    });
  }
};

// Get jobs by ID
exports.getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("Fetching job with ID:", jobId);
    
    // Remove is_deleted from where clause if not all jobs have this field
    const job = await db.Jobs.findOne({
      where: {
        id: jobId
      }
    });
    
    if (!job) {
      console.log("Job not found with ID:", jobId);
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // Format skills for display if needed
    let formattedJob = job.toJSON();
    
    // If skills_required is a string but should be an array
    if (typeof formattedJob.skills_required === 'string' && formattedJob.skills_required) {
      try {
        // First try to parse as JSON
        formattedJob.skills_required = JSON.parse(formattedJob.skills_required);
      } catch (e) {
        // If that fails, split by comma
        formattedJob.skills_required = formattedJob.skills_required
          .split(',')
          .map(skill => skill.trim());
      }
    }

    console.log("Successfully retrieved job:", formattedJob.title);
    
    return res.status(200).json({
      status: "success",
      message: "Job details retrieved successfully",
      data: formattedJob
    });
  } catch (error) {
    console.error("Error in getJobById:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update jobs
exports.updateJobs = async (req, res) => {
  try {
    const job = await db.Jobs.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    await job.update(req.body);
    res.status(200).json({
      status: "success",
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to update job",
      error: { details: error.message },
    });
  }
};

// Delete jobs
exports.deleteJobs = async (req, res) => {
  try {
    const job = await db.Jobs.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    await job.destroy();
    res.status(200).json({
      status: "success",
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete job",
      error: { details: error.message },
    });
  }
};
