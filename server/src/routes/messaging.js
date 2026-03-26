"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messagingService_1 = require("../services/messagingService");
const router = express_1.default.Router();
router.post('/send', async (req, res) => {
    try {
        const { channel, recipientId, text, imagePath, caption } = req.body;
        if (!channel || !recipientId || (!text && !imagePath)) {
            return res.status(400).json({ error: 'channel, recipientId, and either text or imagePath are required' });
        }
        const response = await (0, messagingService_1.sendChannelMessage)({
            channel,
            recipientId,
            text,
            imagePath,
            caption,
        });
        res.json({ ok: true, response });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/telegram/webhook', async (req, res) => {
    try {
        const message = await (0, messagingService_1.parseTelegramMessage)(req.body);
        if (message) {
            await (0, messagingService_1.handleInboundMessage)(message);
        }
        res.json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/whatsapp/webhook', (req, res) => {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === verifyToken && typeof challenge === 'string') {
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
});
router.post('/whatsapp/webhook', async (req, res) => {
    try {
        const message = await (0, messagingService_1.parseWhatsAppMessage)(req.body);
        if (message) {
            await (0, messagingService_1.handleInboundMessage)(message);
        }
        res.json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=messaging.js.map