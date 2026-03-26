import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getProfileByUsername } from './profileService';
import {
  makeUploadFilename,
  saveBufferToDirectory,
  uploadDirectories,
} from './storage';

type TryOnInput = {
  username: string;
  clothingBuffer: Buffer;
  clothingOriginalName: string;
};

export async function runTryOn({ username, clothingBuffer, clothingOriginalName }: TryOnInput) {
  const user = await getProfileByUsername(username);

  if (!user?.profile_image) {
    throw new Error('User profile not found. Please upload your look first.');
  }

  const tempClothingPath = await saveBufferToDirectory(
    uploadDirectories.temp,
    clothingBuffer,
    makeUploadFilename('clothing', clothingOriginalName),
  );

  const clothingImageUrl = 'file://' + path.resolve(tempClothingPath).replace(/\\/g, '/');
  const cleanClothingBlob = await removeBackground(clothingImageUrl);
  const cleanClothingBuffer = Buffer.from(await cleanClothingBlob.arrayBuffer());
  const cleanClothingAbsolutePath = await saveBufferToDirectory(
    uploadDirectories.temp,
    cleanClothingBuffer,
    makeUploadFilename('clean', clothingOriginalName.replace(path.extname(clothingOriginalName), '.png')),
  );

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' });

  const userImagePath = path.resolve(user.profile_image);
  const userImageBase64 = fs.readFileSync(userImagePath).toString('base64');
  const clothingImageBase64 = fs.readFileSync(cleanClothingAbsolutePath).toString('base64');

  const prompt = `
    You are an expert fashion AI.
    Input 1: A photo of a person (User Photo).
    Input 2: A photo of a clean piece of clothing (Clothing Photo).

    Task: Merge the clothing from Input 2 onto the person in Input 1.
    Instructions:
    1. Replace the person's existing clothing with the new one.
    2. Ensure the fit is realistic, following the person's body shape and pose.
    3. Remove any trace of the old clothing.
    4. Maintain the person's face, skin tone, and background from the User Photo.
    5. The output should be a single image of the person wearing the new clothing.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: userImageBase64,
        mimeType: 'image/jpeg',
      },
    },
    {
      inlineData: {
        data: clothingImageBase64,
        mimeType: 'image/png',
      },
    },
  ]);

  const response = await result.response;
  const candidates = response.candidates;

  let resultAbsolutePath = '';
  if (candidates?.[0]?.content?.parts) {
    const imagePart = candidates[0].content.parts.find((part) => 'inlineData' in part && part.inlineData);
    if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
      const imageData = Buffer.from(imagePart.inlineData.data, 'base64');
      resultAbsolutePath = await saveBufferToDirectory(
        uploadDirectories.results,
        imageData,
        makeUploadFilename('result', 'result.png'),
      );
    }
  }

  if (!resultAbsolutePath) {
    resultAbsolutePath = path.join(uploadDirectories.results, makeUploadFilename('placeholder', 'result.jpg'));
    fs.copyFileSync(userImagePath, resultAbsolutePath);
  }

  return {
    resultImagePath: path.relative(process.cwd(), resultAbsolutePath).replace(/\\/g, '/'),
    cleanClothingPath: path.relative(process.cwd(), cleanClothingAbsolutePath).replace(/\\/g, '/'),
  };
}
