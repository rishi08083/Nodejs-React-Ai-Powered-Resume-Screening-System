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
    const response = await axios.get("https://promact.hiringbull.com/");
    const $ = cheerio.load(response.data);

    // $("a.card.card-frxame.card-text-dark").each(async (index, element) => {
    //   const titleElement = $(element).find(".col-sm-9");
    //   const title = titleElement.text().trim();

    //   const link = $(element).attr("href");
    //   const absoluteLink = new URL(link, "https://promact.hiringbull.com").href;
    //   const jobDetails = await getJobDescription(absoluteLink);

    //   jobs.push(jobDetails);
    // });
    const jobPromises = $("a.card.card-frame.card-text-dark")
      .map((index, element) => {
        const titleElement = $(element).find(".col-sm-9");
        const title = titleElement.text().trim();
        const link = $(element).attr("href");
        const absoluteLink = new URL(link, "https://promact.hiringbull.com")
          .href;
        return getJobDescription(absoluteLink, title);
      })
      .get();
    const jobs = await Promise.all(jobPromises);
    console.log(jobs);
    return NextResponse.json(jobs, { status: 200 });
  } catch (err) {
    console.error("Error scraping jobs:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
