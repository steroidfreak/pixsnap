import express from 'express';
import {
  handleInboundMessage,
  parseTelegramMessage,
  parseWhatsAppMessage,
  sendChannelMessage,
} from '../services/messagingService';

const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    const { channel, recipientId, text, imagePath, caption } = req.body;

    if (!channel || !recipientId || (!text && !imagePath)) {
      return res.status(400).json({ error: 'channel, recipientId, and either text or imagePath are required' });
    }

    const response = await sendChannelMessage({
      channel,
      recipientId,
      text,
      imagePath,
      caption,
    });

    res.json({ ok: true, response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/telegram/webhook', async (req, res) => {
  try {
    const message = await parseTelegramMessage(req.body);
    if (message) {
      await handleInboundMessage(message);
    }
    res.json({ ok: true });
  } catch (error: any) {
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
    const message = await parseWhatsAppMessage(req.body);
    if (message) {
      await handleInboundMessage(message);
    }
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
