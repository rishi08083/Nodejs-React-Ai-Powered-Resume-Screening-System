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
            where: { match_score: { [Op.gte]: 40 } },
            attributes: ["name", "email", "phone_number", "job_id"],
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
            html: generateEmailTemplate(candidates),
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
}

const generateEmailTemplate = (candidates) => {
    const branding = `
        <hr style="margin: 40px 0; border-top: 2px solid #d8a31a;" />
          <div style="background-color: #111; padding: 20px; color: #fff; border-radius: 8px;">
            <p style="font-size: 14px; margin: 0 0 10px;"><strong>Website:</strong> <a href="https://promactinfo.com" style="color: #d8a31a; text-decoration: none;">promactinfo.com</a></p>
            <div style="margin-top: 15px; background-color: #fff; padding: 10px; border-radius: 4px;">
              <img src="https://promact.hiringbull.com/Home/GetImage?handler=CompanyLogo&companyId=305" alt="Promact Logo" style="max-width: 100%; height: auto;" />
            </div>
          </div>
          <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 20px;">This is an automated message. Please do not reply to this email.</p>
    `;

    if (!candidates || candidates.length === 0) {
        return `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #004085;">📌 Recommended Candidates List</h2>
                <p>No candidates are currently recommended for hiring.</p>
                <p>Best regards,</p>
                <p><strong>Your Hiring Team</strong></p>
                ${branding}
            </div>
        `;
    }

    const candidatesByJob = candidates.reduce((acc, candidate) => {
        const jobTitle = candidate.jobs.title;
        if (!acc[jobTitle]) acc[jobTitle] = [];
        acc[jobTitle].push(candidate);
        return acc;
    }, {});

    const jobTables = Object.entries(candidatesByJob).map(([jobTitle, candidates]) => {
        const candidateRows = candidates.map(candidate => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${candidate.name}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${candidate.email}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${candidate.phone_number}</td>
            </tr>
        `).join('');

        return `
            <h3 style="color: #004085;">➡️ ${jobTitle}</h3>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                <thead>
                    <tr style="background-color: #f4f4f4;">
                        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Name</th>
                        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Email</th>
                        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Phone Number</th>
                    </tr>
                </thead>
                <tbody>
                    ${candidateRows}
                </tbody>
            </table>
        `;
    }).join('<br>');

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #004085;">📌 Recommended Candidates List</h2>
            <p>Here are the candidates recommended for hiring:</p>
            ${jobTables}
            <p>Best regards,</p>
            <p><strong>Your Hiring Team</strong></p>
            ${branding}
        </div>
    `;
};


module.exports = {mailRecruiter};