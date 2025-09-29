import nc from "next-connect";
import dbConnect from "@/backend/config/dbConnect";
import { getProducts, newProduct } from "@/backend/controllers/productControllers";

dbConnect();

const handler = nc();

handler.get(getProducts);
handler.post(newProduct);

export default handler;
