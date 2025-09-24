import Profile from "@/components/auth/Profile";
import axios from "axios";
import React from "react";
import { cookies } from "next/headers";
import { getCookieName } from "@/helpers/helpers";

const getAddresses = async () => {
  const nextCookies = cookies();
  const cookieName = getCookieName();

  // Handle both dev + prod cookie names
  const nextAuthSessionToken = nextCookies.get(cookieName);

    if (!nextAuthSessionToken?.value) {
    return null; // or throw new Error("No session found");
  }

  if (!nextAuthSessionToken) {
    console.log("⚠️ No session cookie found");
    return []; // or throw new Error("Not authenticated")
  }

  console.log("nextAuthSessionToken", nextAuthSessionToken);

  const { data } = await axios.get(`${process.env.API_URL}/api/address`, {
    headers: {
      Cookie: `${cookieName}=${nextAuthSessionToken.value}`,
    },
    withCredentials: true,
  });

  return data?.addresses || [];
};

const ProfilePage = async () => {
  const addresses = await getAddresses();

  return (
    <div>
      <Profile addresses={addresses} />
    </div>
  );
};

export default ProfilePage;