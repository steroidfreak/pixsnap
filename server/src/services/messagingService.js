"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTelegramMessage = parseTelegramMessage;
exports.parseWhatsAppMessage = parseWhatsAppMessage;
exports.sendChannelMessage = sendChannelMessage;
exports.handleInboundMessage = handleInboundMessage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const profileService_1 = require("./profileService");
const tryOnService_1 = require("./tryOnService");
const storage_1 = require("./storage");
const helpText = [
    'PixSnap commands:',
    '/profile <username> with a photo to save the profile image',
    '/tryon <username> with a photo to generate a try-on result',
].join('\n');
function getTelegramBotToken() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }
    return token;
}
function getWhatsAppConfig() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
        throw new Error('WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID must be configured');
    }
    return { token, phoneNumberId };
}
async function readResponseBuffer(response) {
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
async function downloadTelegramPhoto(fileId) {
    const token = getTelegramBotToken();
    const fileInfoResponse = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const fileInfo = await fileInfoResponse.json();
    if (!fileInfo.ok || !fileInfo.result?.file_path) {
        throw new Error('Failed to resolve Telegram file path');
    }
    const downloadResponse = await fetch(`https://api.telegram.org/file/bot${token}/${fileInfo.result.file_path}`);
    if (!downloadResponse.ok) {
        throw new Error(`Failed to download Telegram image: ${downloadResponse.status}`);
    }
    return {
        buffer: await readResponseBuffer(downloadResponse),
        originalName: path_1.default.basename(fileInfo.result.file_path),
    };
}
async function downloadWhatsAppMedia(mediaId) {
    const { token } = getWhatsAppConfig();
    const mediaResponse = await fetch(`https://graph.facebook.com/v23.0/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const mediaInfo = await mediaResponse.json();
    if (!mediaInfo.url) {
        throw new Error('Failed to resolve WhatsApp media URL');
    }
    const contentResponse = await fetch(mediaInfo.url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!contentResponse.ok) {
        throw new Error(`Failed to download WhatsApp image: ${contentResponse.status}`);
    }
    return {
        buffer: await readResponseBuffer(contentResponse),
        originalName: `whatsapp-media${(0, storage_1.guessExtension)(mediaInfo.mime_type)}`,
    };
}
async function parseTelegramMessage(body) {
    const message = body?.message;
    if (!message?.chat?.id) {
        return null;
    }
    const photos = Array.isArray(message.photo) ? message.photo : [];
    const largestPhoto = photos.at(-1);
    const photo = largestPhoto?.file_id ? await downloadTelegramPhoto(largestPhoto.file_id) : undefined;
    const inboundMessage = {
        channel: 'telegram',
        senderId: String(message.chat.id),
        text: message.caption ?? message.text ?? '',
    };
    if (photo) {
        inboundMessage.photo = photo;
    }
    return inboundMessage;
}
async function parseWhatsAppMessage(body) {
    const change = body?.entry?.[0]?.changes?.[0]?.value;
    const message = change?.messages?.[0];
    if (!message?.from) {
        return null;
    }
    const photo = message.image?.id ? await downloadWhatsAppMedia(message.image.id) : undefined;
    const inboundMessage = {
        channel: 'whatsapp',
        senderId: String(message.from),
        text: message.image?.caption ?? message.text?.body ?? '',
    };
    if (photo) {
        inboundMessage.photo = photo;
    }
    return inboundMessage;
}
function parseCommand(text) {
    const trimmed = text?.trim() ?? '';
    if (!trimmed.startsWith('/')) {
        return null;
    }
    const [command, username] = trimmed.split(/\s+/, 2);
    if (!command) {
        return null;
    }
    return {
        command: command.toLowerCase(),
        username: username?.trim(),
    };
}
async function sendTelegramMessage(input) {
    const token = getTelegramBotToken();
    if (input.imagePath) {
        const form = new FormData();
        form.append('chat_id', input.recipientId);
        if (input.caption) {
            form.append('caption', input.caption);
        }
        form.append('photo', new Blob([await fs_1.default.promises.readFile(path_1.default.resolve(input.imagePath))]), path_1.default.basename(input.imagePath));
        const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: 'POST',
            body: form,
        });
        if (!response.ok) {
            throw new Error(`Telegram sendPhoto failed: ${response.status}`);
        }
        return response.json();
    }
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: input.recipientId,
            text: input.text ?? '',
        }),
    });
    if (!response.ok) {
        throw new Error(`Telegram sendMessage failed: ${response.status}`);
    }
    return response.json();
}
async function uploadWhatsAppMedia(imagePath) {
    const { token, phoneNumberId } = getWhatsAppConfig();
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('file', new Blob([await fs_1.default.promises.readFile(path_1.default.resolve(imagePath))]), path_1.default.basename(imagePath));
    const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });
    const data = await response.json();
    if (!response.ok || !data.id) {
        throw new Error(data.error?.message ?? `WhatsApp media upload failed: ${response.status}`);
    }
    return data.id;
}
async function sendWhatsAppMessage(input) {
    const { token, phoneNumberId } = getWhatsAppConfig();
    const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: input.recipientId,
    };
    if (input.imagePath) {
        payload.type = 'image';
        payload.image = {
            id: await uploadWhatsAppMedia(input.imagePath),
            caption: input.caption,
        };
    }
    else {
        payload.type = 'text';
        payload.text = { body: input.text ?? '' };
    }
    const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message ?? `WhatsApp send failed: ${response.status}`);
    }
    return data;
}
async function sendChannelMessage(input) {
    if (input.channel === 'telegram') {
        return sendTelegramMessage(input);
    }
    return sendWhatsAppMessage(input);
}
async function saveInboundPhoto(channel, senderId, photo) {
    return (0, storage_1.saveBufferToDirectory)(storage_1.uploadDirectories.inbound, photo.buffer, (0, storage_1.makeUploadFilename)(`${channel}-${senderId}`, photo.originalName));
}
async function handleInboundMessage(message) {
    const command = parseCommand(message.text);
    if (!command?.command) {
        await sendChannelMessage({
            channel: message.channel,
            recipientId: message.senderId,
            text: helpText,
        });
        return { handled: true, action: 'help' };
    }
    if (!command.username) {
        await sendChannelMessage({
            channel: message.channel,
            recipientId: message.senderId,
            text: 'A username is required. Example: /profile alice or /tryon alice',
        });
        return { handled: true, action: 'missing-username' };
    }
    if (!message.photo) {
        await sendChannelMessage({
            channel: message.channel,
            recipientId: message.senderId,
            text: 'Attach a photo with the command caption so PixSnap can process it.',
        });
        return { handled: true, action: 'missing-photo' };
    }
    await saveInboundPhoto(message.channel, message.senderId, message.photo);
    if (command.command === '/profile') {
        await (0, profileService_1.saveProfileBuffer)(command.username, message.photo.buffer, message.photo.originalName);
        await sendChannelMessage({
            channel: message.channel,
            recipientId: message.senderId,
            text: `Profile saved for ${command.username}.`,
        });
        return { handled: true, action: 'profile-saved' };
    }
    if (command.command === '/tryon') {
        await sendChannelMessage({
            channel: message.channel,
            recipientId: message.senderId,
            text: `Processing try-on for ${command.username}...`,
        });
        const result = await (0, tryOnService_1.runTryOn)({
            username: command.username,
            clothingBuffer: message.photo.buffer,
            clothingOriginalName: message.photo.originalName,
        });
        await sendChannelMessage({
            channel: message.channel,
            recipientId: message.senderId,
            imagePath: result.resultImagePath,
            caption: `Try-on result for ${command.username}`,
        });
        return { handled: true, action: 'tryon-complete', result };
    }
    await sendChannelMessage({
        channel: message.channel,
        recipientId: message.senderId,
        text: helpText,
    });
    return { handled: true, action: 'unknown-command' };
}
//# sourceMappingURL=messagingService.js.map