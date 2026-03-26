export declare const uploadDirectories: {
    root: string;
    profiles: string;
    results: string;
    temp: string;
    inbound: string;
};
export declare function ensureUploadDirectories(): void;
export declare function makeUploadFilename(prefix: string, originalName?: string): string;
export declare function saveBufferToDirectory(directory: string, buffer: Buffer, fileName: string): Promise<string>;
export declare function guessExtension(contentType?: string | null): ".jpg" | ".png" | ".webp" | ".gif";
//# sourceMappingURL=storage.d.ts.map