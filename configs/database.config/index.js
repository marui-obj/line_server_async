const config = module.exports = {};

config.uri = (process.env.MONGO_URI || 'mongodb://localhost:27017/');
config.db = (process.env.MONGO_DB || 'Line_Task');