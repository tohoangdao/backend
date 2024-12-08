// Import your existing Express app
const app = require('../app'); // Adjust the path if needed
const serverless = require('serverless-http');

// Wrap the Express app
module.exports = serverless(app);
