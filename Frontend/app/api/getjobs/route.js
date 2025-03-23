import * as cheerio from "cheerio";
import axios from "axios";
import { NextResponse } from "next/server";
const getJobDescription = async (url, title) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const job = {
      title: title,
      description: $(".col-lg-8.mb-9 p").first().text().trim(),
      roles: [],
      mustHaveSkills: [],
      shouldHaveSkills: [],
      jobType: $("span.fas.fa-clock")
        .closest(".media")
        .find(".media-body span.font-weight-medium")
        .text()
        .trim(),

      experience: $("span.fa.fa-graduation-cap") // Note the difference between `fas` and `fa`
        .closest(".media")
        .find(".media-body span.font-weight-medium")
        .text()
        .trim(),

      openings: $("span.fas.fa-briefcase")
        .closest(".media")
        .find(".media-body span.font-weight-medium")
        .text()
        .trim(),

      companyWebsite: $("span.fas.fa-globe")
        .closest(".media")
        .find("a")
        .attr("href"),
      applyLink: $("a.btn-primary").attr("href"),
      contact: {
        phone: $("a[href^='tel']").text().trim(),
        address: $("address.text-secondary").text().trim(),
      },
    };

    $("p:contains('Roles & Responsibilities:')")
      .next("ul")
      .find("li")
      .each((i, el) => {
        job.roles.push($(el).text().trim());
      });

    $("p:contains('Must Have Skills:')")
      .next("ul")
      .find("li")
      .each((i, el) => {
        job.mustHaveSkills.push($(el).text().trim());
      });

    $("p:contains('Should Have Skills:')")
      .next("ul")
      .find("li")
      .each((i, el) => {
        job.shouldHaveSkills.push($(el).text().trim());
      });

    return job;
  } catch (error) {
    console.error("Error scraping job details:", error);
    return { error: error.message };
  }
};
export async function GET() {
  try {
    // const response = await axios.get("https://promact.hiringbull.com/");
    //   const $ = cheerio.load(response.data);

    // $("a.card.card-frxame.card-text-dark").each(async (index, element) => {
    //   const titleElement = $(element).find(".col-sm-9");
    //   const title = titleElement.text().trim();

    //   const link = $(element).attr("href");
    //   const absoluteLink = new URL(link, "https://promact.hiringbull.com").href;
    //   const jobDetails = await getJobDescription(absoluteLink);

    //   jobs.push(jobDetails);
    // });
    // const jobPromises = $("a.card.card-frame.card-text-dark")
    //   .map((index, element) => {
    //     const titleElement = $(element).find(".col-sm-9");
    //     const title = titleElement.text().trim();
    //     const link = $(element).attr("href");
    //     const absoluteLink = new URL(link, "https://promact.hiringbull.com")
    //       .href;
    //     return getJobDescription(absoluteLink, title);
    //   })
    //   .get();
    // let jobs = await Promise.all(jobPromises);

    let jobs = [
      {
        title: "Sales Executive (Tele-Calling & Software Demo Specialist)",
        description:
          "Promact was founded in 2003, Promact is a culturally unique software company prioritizing simplicity, transparency, and client-centricity. Committed to top-notch products, we take full ownership of each project and maintain open-door policies for healthy employer-employee relationships. Promoting a fair work culture with a problem-solving attitude, we emphasize quality through agile methodologies. Our initiatives, including crash courses and hackathons, create a diverse talent pool, fostering self-sufficient and competitive employees. As a pioneering company in Vadodara, we persistently invent new tools, upgrade skills and envision sharing more success stories in the future.",
        roles: [
          "Conduct outbound calls to potential customers to promote products and services.",
          "Deliver compelling sales pitches and follow a structured sales script.",
          "Handle objections and provide clear, persuasive responses to customer queries.",
          "Schedule and conduct software demos for clients, ensuring an engaging and informative experience.",
          "Maintain accurate records of calls, leads, and follow-ups using CRM tools.",
          "Develop and refine sales strategies to increase conversion rates.",
          "Work closely with the sales and marketing team to align outreach efforts.",
          "Meet and exceed sales targets and KPIs.",
          "Stay updated with product knowledge to effectively address customer concerns.",
        ],
        mustHaveSkills: [
          "Fluency in English (both verbal and written).",
          "Strong confidence and an engaging communication style.",
          "Experience in sales, tele calling, and lead generation.",
          "Ability to handle objections and negotiate effectively.",
          "Experience in conducting product demos (preferably software-based).",
          "Proficiency in CRM tools for sales tracking.",
          "Target-driven mindset with a passion for sales.",
        ],
        shouldHaveSkills: [
          "Basic knowledge of the industry relevant to software solutions.",
          "Experience in B2B and B2C sales.",
          "Ability to create and refine sales scripts.",
          "Familiarity with sales automation tools.",
          "Good problem-solving skills and adaptability.",
        ],
        jobType: "Full Time Permanent",
        experience: "0.6 - 1 years",
        openings: "2",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/4488",
        contact: {
          phone: "+91 - 8700393720",
          address:
            "Vadodara, Gujarat, India \n" +
            "                                    \n" +
            "                                \n" +
            "\n" +
            "                                \n" +
            "                                    Phone: \n" +
            "+91 - 8700393720",
        },
      },
      {
        title:
          "Software Engineer - II (Android, React Native, Java Spring Boot)",
        description:
          "Promact is looking for a passionate Software Engineer who is keen to learn and grow with the organization. The candidate will be responsible for the development, design and implementation of new or modified software products or ongoing business projects. The candidate should have a profound view of the project development and suggest the best ways to develop, bearing in mind the final market goal.",
        roles: [],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "",
        experience: "3 - 5 years",
        openings: "1",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/4381",
        contact: {
          phone: "+91 - 8700393720",
          address:
            "Vadodara, Gujarat, India \n" +
            "                                    \n" +
            "                                \n" +
            "\n" +
            "                                \n" +
            "                                    Phone: \n" +
            "+91 - 8700393720",
        },
      },
      {
        title: "DevOps Engineer",
        description:
          "Promact is looking for a passionate DevOps Engineer who is keen to learn and grow with the organization. The candidate will focus on supporting development and operations through basic DevOps practices. They ensure effective deployment, automation, and operation of environments, with a focus on learning and applying foundational DevOps principles.",
        roles: [
          "Implement and manage cloud infrastructure on major platforms (AWS/Azure/GCP)",
          "Design and develop Infrastructure as Code using Terraform and other IaC tools",
          "Configure and maintain CI/CD pipelines using GitHub Actions, Azure DevOps, or GitLab",
          "Set up and manage containerized environments using Docker and container orchestration platforms",
          "Implement monitoring and logging solutions for infrastructure and applications",
          "Manage version control systems and branching strategies",
          "Configure and maintain networking components including VPCs, subnets, and security",
          "Automate system configuration and deployment using configuration management tools",
          "Troubleshoot infrastructure and application issues across different operating systems",
          "Collaborate with development teams to optimize deployment processesMust have skills:",
        ],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "2 - 5 years",
        openings: "2",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/4347",
        contact: {
          phone: "+91 - 8700393720",
          address:
            "Vadodara, Gujarat, India \n" +
            "                                    \n" +
            "                                \n" +
            "\n" +
            "                                \n" +
            "                                    Phone: \n" +
            "+91 - 8700393720",
        },
      },
      {
        title: "Senior Software Engineer (React, Next.js, Node.js)",
        description:
          "Promact is looking for a passionate Software Engineer who is keen to learn and grow with the organization. The candidate will be responsible for the development, design and implementation of new or modified software products or ongoing business projects. The candidate should have a profound view of product development and suggest the best ways to develop, bearing in mind the final market goal.",
        roles: [
          "Requirement elicitation & converting requirements into code",
          "Effort estimation",
          "Database Design",
          "Tools, libraries, and frameworks research and identification",
          "Coordinate and support juniors for overall software development activities in team",
          "TDD (Test Driven Development) and Unit testing",
          "Code review and refactoring based on provided reviews",
          "Validation of developed code against requirements and test cases",
          "Expert in application security aspects and adherence \n" +
            "Recommend product improvements and updates \n" +
            "Effective verbal/written",
          "communication with the team members for overall project coordination.",
          "Contribute and conduct verbal/written communication with different stakeholders (client/customer, product owner, user etc.).",
          "Maintain organization values, vision and mission",
          "Active participation in organization activities\\",
          "Documentation",
          "Participation in Scrum ceremonies",
          "Time and Task tracking in relevant project management tool",
          "Active participation in trainings provided by organizationMust have skills:",
          "Node.js",
          "React",
          "NextJS",
          "Working experience with HTML, CSS, Javascript and Typescript",
          "Express \n" +
            "Relational Database Fundamentals (Normalization, Indexing, Performance etc.)",
          "SQL Queries",
          "Postgresql/Microsoft SQL Server/MySQL",
          "NoSQL Database fundamentals",
          "Sequelize /TypeORM",
          "Git/TFVC",
          "Jest",
          "Understanding of SDLC and Agile concepts",
          "Experience with project management tools (Jira/Redmine/Azure DevOps/Asana)",
          "Understanding of CI/CD and ToolsGood to have Skills:",
          "Understanding of Cloud platforms (AWS/Azure/GCP)",
          "Understanding of DevOps (Docker, Kubernetes, Linux fundamentals and Scripting)",
          "Understanding of Networking fundamentals \n" +
            "Understanding of Microservices",
        ],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "3 - 5 years",
        openings: "1",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/4346",
        contact: {
          phone: "+91 - 8700393720",
          address:
            "Vadodara, Gujarat, India \n" +
            "                                    \n" +
            "                                \n" +
            "\n" +
            "                                \n" +
            "                                    Phone: \n" +
            "+91 - 8700393720",
        },
      },
      {
        title: "Software Engineer - II (React Native)",
        description:
          "Promact is looking for a passionate Software Engineer who is keen to learn and grow with the organization. The candidate will be responsible for the development, design and implementation of new or modified software products or ongoing business projects. The candidate should have a profound view of product development and suggest the best ways to develop, bearing in mind the final market goal.",
        roles: [
          "Requirement elicitation & converting requirements into code",
          "Effort estimations",
          "Tools, libraries, and frameworks research and identification",
          "Coordinate and support juniors for overall software development activities in team",
          "TDD (Test Driven Development) and Unit testing",
          "Code review and refactoring based on provided reviews",
          "Validation of developed code against requirements and test cases",
          "Expert in application security aspects and adherence",
          "Recommend product improvements and updates",
          "Effective verbal/written communication with the team members for overall project coordination.",
          "Contribute and conduct verbal/written communication with different stakeholders (client/customer, product owner, user etc.).",
          "Maintain organization values, vision and mission",
          "Active participation in organization activities",
          "Documentation",
          "Participation in Scrum ceremonies",
          "Time and Task tracking in relevant project management tool",
          "Active participation in trainings provided by organization",
        ],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "3 - 5 years",
        openings: "3",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/4207",
        contact: {
          phone: "+91 - 8700393720",
          address:
            "Vadodara, Gujarat, India \n" +
            "                                    \n" +
            "                                \n" +
            "\n" +
            "                                \n" +
            "                                    Phone: \n" +
            "+91 - 8700393720",
        },
      },
      {
        title: "Software Engineer - II (AI/ML)",
        description:
          "Promact is looking for an experienced and passionate Software Engineer - II (AI & ML) to play a \n" +
          "key role in driving our Artificial Intelligence and Machine Learning initiatives. The candidate will \n" +
          "collaborate closely with the AI/ML team to design, develop, implement, and maintain advanced \n" +
          "AI/ML models for various projects, ensuring high-quality deliverables and adherence to best \n" +
          "practices.",
        roles: [],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "3.1 - 5 years",
        openings: "2",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/3567",
        contact: { phone: "", address: "" },
      },
      {
        title: "Tech lead - AI/ML",
        description:
          "Promact is seeking a passionate and experienced Tech Lead - AI/ML to drive our expanding \n" +
          "initiatives in the field of Artificial Intelligence and Machine Learning. The ideal candidate will \n" +
          "have a deep understanding of AI/ML concepts, hands-on experience with relevant technologies, \n" +
          "and strong leadership skills to guide our team in executing various AI/ML projects successfully.",
        roles: [],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "5 - 8 years",
        openings: "2",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/3523",
        contact: { phone: "", address: "" },
      },
      {
        title:
          "Software Engineer - III (.NET, Angular, and Mapping; Geospatial Technologies)",
        description:
          "Promact is looking for a passionate Software Engineer who is keen to learn and grow with the organization. The candidate will be responsible for the development, design and implementation of new or modified software products or ongoing business projects. The candidate should have a profound view of the project development and suggest the best ways to develop, bearing in mind the final market goal.",
        roles: [],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "5 - 7 years",
        openings: "1",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/3483",
        contact: { phone: "", address: "" },
      },
      {
        title: "Tech Lead",
        description:
          "Promact is looking for a passionate Tech Lead who is keen to learn and grow with the organization. The candidate will be responsible for all technical design and technology decision making in projects along with general development work. The candidate will be the single point of contact for all things Technical in assigned Project/s.",
        roles: [],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "7 - 11 years",
        openings: "3",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/2581",
        contact: {
          phone: "+91 - 9327601914",
          address:
            "PROMACT INFOTECH PRIVATE LIMITED\n" +
            "301-6, Wing A-B, Monalisa Business Centre, Near More Mega Store, Manjalpur \n" +
            "                                    Vadodara, Gujarat\n" +
            "                                \n" +
            "\n" +
            "                                \n" +
            "                                    Phone: \n" +
            "+91 - 9327601914",
        },
      },
      {
        title: "Software Engineer - III (.NET and Angular)",
        description:
          "Promact is looking for a passionate Software Engineer who is keen to learn and grow with the organization. The candidate will be responsible for the development, design and implementation of new or modified software products or ongoing business projects. The candidate should have a profound view of the project development and suggest the best ways to develop, bearing in mind the final market goal.",
        roles: [],
        mustHaveSkills: [],
        shouldHaveSkills: [],
        jobType: "Full Time Permanent",
        experience: "4+ years",
        openings: "5",
        companyWebsite: "https://promactinfo.com/",
        applyLink: "/CareerSite/Jobs/Apply/876",
        contact: {
          phone: "+91 - 9327601914",
          address:
            "PROMACT INFOTECH PRIVATE LIMITED\n" +
            "301-6, Wing A-B, Monalisa Business Centre, Near More Mega Store, Manjalpur \n" +
            "                                    Vadodara, Gujrat\n" +
            "                                \n" +
            "\n" +
            "                                Email: hr@promactinfo.com\n" +
            "                                \n" +
            "                                    Phone: \n" +
            "+91 - 9327601914",
        },
      },
    ];

    return NextResponse.json(jobs, { status: 200 });
  } catch (err) {
    console.error("Error scraping jobs:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
