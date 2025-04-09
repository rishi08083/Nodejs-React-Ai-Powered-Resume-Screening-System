const db  = require('../../models');
const {Op} = require('sequelize');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailRecruiter = async (req, res) => {
    try {
        const user = req.user;

        // Fetch candidates along with their job titles
        const candidates = await db.Candidates.findAll({
            where: { is_recommended: "YES", user_id: user.id},
            attributes: ["name", "email", "phone_number", "job_id", "match_score"],
            include: [{
                model: db.Jobs,
                as: "jobs",
                attributes: ["title"]
            }],
            raw: true,
            nest: true
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.user.email,
            subject: "Recommended Candidates List",
            text: `Candidates List`,
            html: generateEmailTemplate(candidates, user.user.name),
        };
    
        transporter.sendMail(mailOptions);

        res.status(200).json({
            status: "success",
            message: "Mail sent to the recruiter",
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to send mail to the recruiter",
            error: { details: error.message },
        });
    }
};

const generateEmailTemplate = (candidates, name) => {
    const branding = `
      <hr style="margin: 40px 0; border-top: 2px solid #d8a31a;" />
      <div style="background-color: #fff; padding: 20px; color: #000; border-radius: 8px;">
          <p style="font-size: 14px; margin: 0 0 10px;">
            <strong>Website:</strong> 
            <a href="https://rs-fe.rishi.publicvm.com" style="color: #d8a31a; text-decoration: none;">ats-recruitment.com</a>
          </p>
          <div style="margin-top: 15px; padding-top: 10px; border-radius: 4px;">
            <img 
              src="https://www.theatsteam.com/wp-content/uploads/2025/01/ATS_background.jpg" 
              alt="ATS Logo" 
              style="width: 300px; height: auto; display: block;" 
            />
          </div>
      </div>
      <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 20px;">
        This is an automated message. Please do not reply to this email.
      </p>
    `;
  
    const containerStart = `
      <div style="width: 100%; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 800px; margin: auto; background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif;">
    `;
  
    const containerEnd = `
        </div>
      </div>
    `;
  
    if (!candidates || candidates.length === 0) {
      return `
        ${containerStart}
          <p>Hello <strong>${name}</strong>,</p>
          <p>We hope you're doing well. As part of our resume screening process, we checked for candidates matching your job requirements.</p>
          <p style="margin-top: 20px;">Currently, there are no candidates that meet the matching criteria for your job listings.</p>
          <p>We will continue monitoring applications and notify you when suitable candidates are found.</p>
          <br />
  
          <p style="margin-top: 30px;">
            You can also view the full candidate list directly on the ATS platform by visiting the following link:<br/>
            <a href="https://rs-fe.rishi.publicvm.com/dashboard/recruiter/candidates" 
                style="color: #d8a31a; text-decoration: none;">
                View Candidates on ATS Platform
            </a>
        </p>
  
        <br />
        <p>Best regards,</p>
        <p><strong>ATS Team</strong></p>
          ${branding}
        ${containerEnd}
      `;
    }
  
    const candidatesByJob = candidates.reduce((acc, candidate) => {
      const jobTitle = candidate.jobs.title;
      if (!acc[jobTitle]) acc[jobTitle] = [];
      acc[jobTitle].push(candidate);
      return acc;
    }, {});
  
    const columnWidths = {
      name: '25%',
      score: '15%',
      email: '35%',
      phone: '25%'
    };
  
    const jobSections = Object.entries(candidatesByJob).map(([jobTitle, candidates]) => {
      const rows = candidates.map(candidate => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${candidate.name}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${candidate.match_score}%</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${candidate.email}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${candidate.phone_number}</td>
        </tr>
      `).join('');
  
      return `
        <h3 style="color: #2c3e50; margin-top: 30px;">➡️ ${jobTitle}</h3>
        <table style="border-collapse: collapse; width: 100%; margin-top: 10px; table-layout: fixed;">
          <colgroup>
            <col style="width: ${columnWidths.name};" />
            <col style="width: ${columnWidths.score};" />
            <col style="width: ${columnWidths.email};" />
            <col style="width: ${columnWidths.phone};" />
          </colgroup>
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Name</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Match Score</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Email</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Phone Number</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }).join('');
  
    return `
      ${containerStart}
        <p>Hello <strong>${name}</strong>,</p>
        <p>We hope you're doing well. Based on the recent screening, we've identified a list of recommended candidates who closely match the job requirements. Please find the detailed list below, categorized by job roles.</p>
  
        <h2 style="text-align: center; color: #333; margin-top: 40px;">📌 Recommended Candidates List</h2>
  
        ${jobSections}
        
        <p style="margin-top: 30px;">
            You can also view the full candidate list directly on the ATS platform by visiting the following link:
            <a href="https://rs-fe.rishi.publicvm.com/dashboard/recruiter/candidates" 
                style="color: #d8a31a; text-decoration: none;">
                View Candidates on ATS Platform
            </a>
        </p>
  
        <br />
        <p>Best regards,</p>
        <p><strong>ATS Team</strong></p>
        ${branding}
      ${containerEnd}
    `;
  };  

module.exports = {mailRecruiter};