const config = require('./config');
const { Client } = require('@line/bot-sdk')

const lineConfig = {
    channelAccessToken: (process.env.LINE_CHANNEL_ACCESS_TOKEN || config.channelAccessToken),
    channelSecret: (process.env.LINE_CHANNEL_SECRET || config.channelSecret)
}

const lineClient = new Client({
    channelAccessToken: lineConfig.channelAccessToken,
    channelSecret: lineConfig.channelSecret
});

module.exports = {
    lineConfig,
    lineClient
};