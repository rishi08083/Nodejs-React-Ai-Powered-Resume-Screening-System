"use strict";

require("dotenv").config(); // Ensure .env variables are loaded

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development"; // Dynamically select environment
const config = require("../config/config")[env];

console.log(`Running in ${env} mode`);

const db = {};
let sequelize;

try {
  if (config) {
    sequelize = new Sequelize(config);
  }

  console.log(`Connected to PostgreSQL (${env} mode)`);
} catch (error) {
  console.error("Failed to connect to database:", error);
}

// Auto-import all models
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Apply model associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Sync database
db.sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synchronized with associations!"))
  .catch((err) => console.error("Sync error:", err));

module.exports = db;
