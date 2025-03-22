const express = require("express");
const morgan = require("morgan");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.SERVER_PORT;
const cors = require("cors");

app.use(express.json());
app.use(morgan("dev"));
//cors
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from Next.js frontend
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // If using cookies/authentication
}));

// Routes
const indexRouter = require("./routes/indexRoutes");
const errorRouter = require("./routes/errorRoutes");

// Middleware
app.use("/api", indexRouter);

app.use(errorRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
