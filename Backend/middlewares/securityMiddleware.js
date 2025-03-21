const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

module.exports = (app) => {
  // Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://trusted.cdn.com"],
          objectSrc: ["'none'"],
          imgSrc: ["'self'", "data:"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginResourcePolicy: { policy: "same-origin" }, // Restrict CORS within the same origin
    })
  );

  // Prevent XSS Attacks
  app.use(xss());

  // Rate limiting (General API Limit: 100 requests per 10 mins)
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    message: "Too many requests, please try again later",
  });
  app.use(apiLimiter);

  // Rate limiting (Stricter for Login Routes: 5 attempts per 15 mins)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many login attempts, please try again later",
  });
  app.use("/api/auth/login", loginLimiter);

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Enable CORS with Restriction (Only allow frontend domain)
  app.use(
    cors({
      origin: ["https://your-frontend-domain.com"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
};
