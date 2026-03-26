type TryOnInput = {
    username: string;
    clothingBuffer: Buffer;
    clothingOriginalName: string;
};
export declare function runTryOn({ username, clothingBuffer, clothingOriginalName }: TryOnInput): Promise<{
    resultImagePath: string;
    cleanClothingPath: string;
}>;
export {};
//# sourceMappingURL=tryOnService.d.ts.map