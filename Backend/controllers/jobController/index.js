const db = require("../../models");

//Fetch jobs
exports.fetchJobs = async(req, res) => {
    try {
        const response = await fetch(""); //Insert API here between "";
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs`);
        }

        const jobsData = await response.json();

        jobsData.map( async (curr) => {
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
        })
    
        res.status(201).json({ message: "Jobs stored successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

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
        res.status(201).json(jobs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get All jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findAll();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get jobs by ID
exports.getJobById = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) return res.status(404).json({ error: "jobs not found" });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update jobs
exports.updateJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) return res.status(404).json({ error: "jobs not found" });

        await db.Jobs.update(req.body);
        res.status(200).json(jobs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete jobs
exports.deleteJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) return res.status(404).json({ error: "jobs not found" });

        await db.Jobs.destroy();
        res.status(200).json({ message: "jobs deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
