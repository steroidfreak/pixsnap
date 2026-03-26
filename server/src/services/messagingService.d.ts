type SupportedChannel = 'telegram' | 'whatsapp';
type InboundMessage = {
    channel: SupportedChannel;
    senderId: string;
    text?: string;
    photo?: {
        buffer: Buffer;
        originalName: string;
    };
};
type SendMessageInput = {
    channel: SupportedChannel;
    recipientId: string;
    text?: string;
    imagePath?: string;
    caption?: string;
};
export declare function parseTelegramMessage(body: any): Promise<InboundMessage | null>;
export declare function parseWhatsAppMessage(body: any): Promise<InboundMessage | null>;
export declare function sendChannelMessage(input: SendMessageInput): Promise<any>;
export declare function handleInboundMessage(message: InboundMessage): Promise<{
    handled: boolean;
    action: string;
    result?: never;
} | {
    handled: boolean;
    action: string;
    result: {
        resultImagePath: string;
        cleanClothingPath: string;
    };
}>;
export {};
//# sourceMappingURL=messagingService.d.ts.map