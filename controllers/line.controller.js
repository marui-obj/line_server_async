const { handleEvent } = require('../services/line.service');
const lineService = require('../services/line.service');

const webhook = async(req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
}

const pushMessage = async(req, res) => {
    const { userId, messages } = req.body;
    try{
        const result = await lineService.pushMessage(userId, messages)
        res.status(200).send(result);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
}

module.exports = {
    webhook,
    pushMessage
}