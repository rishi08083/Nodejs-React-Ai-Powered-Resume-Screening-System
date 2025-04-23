const express = require("express");
const morgan = require("morgan");
const app = express();
require("dotenv").config();
const PORT = process.env.SERVER_PORT;
const securityMiddleware = require("./middlewares/securityMiddleware");
securityMiddleware(app);
app.use(express.json());
app.use(morgan("dev"));
// require('./cron-job/screenCandidate.js');
// require('./cron-job/dailyMailScheduler.js')
// require('./cron-job/emailCrawler.js');

// Routes
const indexRouter = require("./routes/indexRoutes");
const errorRouter = require("./routes/errorRoutes");

// Middleware
app.use("/api", indexRouter);

app.use(errorRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
