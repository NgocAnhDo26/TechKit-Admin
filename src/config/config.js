import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import multer from 'multer';

dotenv.config({ path: '.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize client.
const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();

// Init database
export const prisma = new PrismaClient();

// Configure Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

export { cloudinary, redisClient, upload };
