const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

module.exports = (app) => {
  // Prevent XSS Attacks
  app.use(xss());

  // Enable CORS - Place this BEFORE other middleware
  app.use(
    cors({
      origin: function (origin, callback) {
        const allowedOrigins = [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://181.214.44.15:3001",
          "https://rs-fe.rishi.publicvm.com",
          // Add your production domain when ready
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`CORS blocked request from: ${origin}`);
          callback(null, false);
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );

  // Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "https://trusted.cdn.com",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://181.214.44.15:3001",
            "https://rs-fe.rishi.publicvm.com",
          ],
          connectSrc: [
            "'self'",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://181.214.44.15:3001",
            "https://rs-fe.rishi.publicvm.com",
          ],
          objectSrc: ["'none'"],
          imgSrc: ["'self'", "data:"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    })
  );

  // General API Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: true,
      message: "Too many requests, please try again later",
    },
  });
  app.use("/api/auth/login", apiLimiter);

  // Stricter Rate Limiting for Login Routes
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: true,
      message: "Too many login attempts, please try again later",
    },
  });
  app.use("/api/auth/login", loginLimiter);

  // Prevent HTTP Parameter Pollution
  app.use(hpp());
};
