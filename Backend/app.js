const express = require("express");
const morgan = require("morgan");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.SERVER_PORT;

app.use(express.json());
app.use(morgan("dev"));

// Routes
const indexRouter = require("./routes/indexRoutes");
const errorRouter = require("./routes/errorRoutes");

// Middleware
app.use("/api", indexRouter);

app.use(errorRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
