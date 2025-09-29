import dbConnect from "@/backend/config/dbConnect";
import { registerUser } from "@/backend/controllers/authControllers";
import nc from "next-connect";
import onError from '@/backend/middlewares/errors';

const handler = nc({ onError });

// Connect to database
dbConnect();

// Middleware to handle CORS
handler.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    return res.status(200).end();
  }

  next();
});

// Your existing POST handler
handler.post(registerUser);

export default handler;
