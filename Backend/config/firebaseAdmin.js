const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Ensure this file is in the config folder

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();

module.exports = { auth };
