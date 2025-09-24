import dbConnect from "@/backend/config/dbConnect"
import { getAddresses, newAddress } from "@/backend/controllers/addressControllers";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { default as nc } from "next-connect";
// import onError from "@/backend/middlewares/errors"


const handler = nc( );

dbConnect();

handler.use(isAuthenticatedUser).post(newAddress);
handler.use(isAuthenticatedUser).get(getAddresses);

export default handler;