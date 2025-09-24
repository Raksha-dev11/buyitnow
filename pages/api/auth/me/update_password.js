import dbConnect from "@/backend/config/dbConnect"
import { updatePassword } from "@/backend/controllers/authControllers";
import { default as nc } from "next-connect";
import onError from "@/backend/middlewares/errors"
import { isAuthenticatedUser } from "@/backend/middlewares/auth";


const handler = nc({ onError });

dbConnect();

handler.use(isAuthenticatedUser).put(updatePassword);

export default handler;