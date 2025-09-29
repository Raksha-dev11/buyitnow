import nc from "next-connect";
import dbConnect from "@/backend/config/dbConnect";
import onError from "@/backend/middlewares/errors";
import { getProducts, newProduct } from "@/backend/controllers/productControllers";

dbConnect();

const handler = nc({ onError }); // <-- works now

handler.get(getProducts);
handler.post(newProduct);

export default handler;