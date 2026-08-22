import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { env } from "../config/env.js";

const prisma = new PrismaClient();

const googleClient = new OAuth2Client(
  env.googleClientId
);

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export async function verifyGoogleToken(
  credential: string
): Promise<GoogleUserPayload> {
  if (!credential) {
    throw new Error("Google credential is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token");
  }

  if (!payload.sub) {
    throw new Error("Google account ID is missing");
  }

  if (!payload.email) {
    throw new Error("Google account email is missing");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split("@")[0],
    avatarUrl: payload.picture ?? null,
  };
}

export async function findOrCreateGoogleUser(
  googleUser: GoogleUserPayload
) {
  const user = await prisma.user.upsert({
    where: {
      googleId: googleUser.googleId,
    },

    update: {
      name: googleUser.name,
      email: googleUser.email,
      avatarUrl: googleUser.avatarUrl,
    },

    create: {
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.avatarUrl,
    },
  });

  return user;
}

export function createSessionToken(userId: string) {
  return jwt.sign(
    {
      userId,
    },
    env.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
}

export function verifySessionToken(token: string) {
  const decoded = jwt.verify(
    token,
    env.jwtSecret
  );

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("userId" in decoded)
  ) {
    throw new Error("Invalid session token");
  }

  return decoded as {
    userId: string;
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      googleId: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}