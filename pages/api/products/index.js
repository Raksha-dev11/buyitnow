import nc from "next-connect";
import dbConnect from "@/backend/config/dbConnect";
import { getProducts, newProduct } from "@/backend/controllers/productControllers";

const handler = nc({
  onError: (err, req, res, next) => {
    console.error('API Error:', err.stack);
    res.status(500).json({ error: err.message });
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ error: `Method ${req.method} Not Allowed` });
  },
});

// Connect to database
handler.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

handler.get(getProducts);
handler.post(newProduct);

export default handler;
