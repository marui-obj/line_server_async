const config = module.exports = {};
const userConfig = require('./config');

config.api = (process.env.JOB_API || userConfig.api);

console.log(`job API: ${config.api}`);