const { middleware } = require('@line/bot-sdk');
const express = require('express');
const router = express.Router();

const lineController = require('../controllers/line.controller');

const lineMiddleware = require('../controllers/line.middleware');

const { lineConfig } = require('../configs/line.config');

router.post('/webhook', middleware(lineConfig), lineMiddleware.showInfo, lineController.webhook);

router.use(express.json())
router.post('/push', lineController.pushMessage);

module.exports = router;