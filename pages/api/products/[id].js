import dbConnect from "@/backend/config/dbConnect";
import { getProduct, updateProduct, deleteProduct } from "@/backend/controllers/productControllers";
import nc from "next-connect";
import onError from "@/backend/middlewares/errors";

// Connect to DB
dbConnect();

// Initialize handler with error middleware
const handler = nc({ onError });

// GET single product
handler.get(getProduct);

// PUT to update product
handler.put(updateProduct);

// DELETE to remove product
handler.delete(deleteProduct);

export default handler;
