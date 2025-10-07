import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/backend/models/user";
import bcrypt from "bcryptjs";
import dbConnect from "@/backend/config/dbConnect";
import GoogleProvider from "next-auth/providers/google";


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
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        await dbConnect();
        
        // Check if user exists
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user for Google sign-in
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            avatar: {
              url: user.image,
            },
            role: "user",
          });
        }
        
        // Attach DB user to the user object
        user._id = existingUser._id.toString();
        user.role = existingUser.role;
      }
      return true;
    },
    jwt: async ({ token, user, trigger, account }) => {
      if (user) {
        // For Google login, user object has _id and role from signIn callback
        if (account?.provider === "google") {
          await dbConnect();
          const dbUser = await User.findById(user._id);
          token.user = dbUser;
        } else {
          // For credentials login
          token.user = user;
        }
      }
      
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