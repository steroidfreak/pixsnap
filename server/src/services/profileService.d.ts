export declare function saveProfileImage(username: string, profileImagePath: string): Promise<{
    username: string;
    profile_image: string;
}>;
export declare function getProfileByUsername(username: string): Promise<any>;
export declare function saveProfileBuffer(username: string, buffer: Buffer, originalName: string): Promise<{
    username: string;
    profile_image: string;
}>;
//# sourceMappingURL=profileService.d.ts.map