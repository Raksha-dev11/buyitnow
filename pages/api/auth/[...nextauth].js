import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/backend/models/user";
import bcrypt from "bcryptjs";
import dbConnect from "@/backend/config/dbConnect";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        dbConnect();

        const { email, password } = credentials;
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          throw new Error("Invalid Email or Password");
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
          throw new Error("Invalid Email or Password");
        }

        return user;
      },
    }),
  ],
  callbacks: {
  jwt: async ({ token, user, trigger }) => {
    if (user) token.user = user;
    
    // Update session when triggered
    if (trigger === "update") {
      const updatedUser = await User.findById(token.user._id);
      token.user = updatedUser;
    }
    return token;
  },
  session: async ({ session, token }) => {
    session.user = token.user;
    delete session?.user?.password;
    return session;
  },
},
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default function auth(req, res) {
  return NextAuth(req, res, authOptions);
}