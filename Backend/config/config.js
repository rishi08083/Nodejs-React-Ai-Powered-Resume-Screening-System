require("dotenv").config();

const config = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    port: process.env.DEV_DB_PORT,
    dialect: process.env.DEV_DB_DIALECT || "postgres",
    logging: false,
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: process.env.PROD_DB_DIALECT || "postgres",
    //  dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false, // Required for Render, AWS, etc.
    //   },
    // },
    logging: false,
  },
  UAT: {
    username: process.env.UAT_DB_USERNAME,
    password: process.env.UAT_DB_PASSWORD,
    database: process.env.UAT_DB_NAME,
    host: process.env.UAT_DB_HOSTNAME,
    port: process.env.UAT_DB_PORT,
    dialect: process.env.UAT_DB_DIALECT || "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Render, AWS, etc.
      },
    },
    logging: false,
  },
};

module.exports = config;
