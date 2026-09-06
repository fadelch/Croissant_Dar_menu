import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function requireAdminEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required Firebase Admin environment variable: ${name}`);
  }

  return value;
}

const projectId = requireAdminEnv(process.env.FIREBASE_ADMIN_PROJECT_ID, "FIREBASE_ADMIN_PROJECT_ID");
const clientEmail = requireAdminEnv(
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  "FIREBASE_ADMIN_CLIENT_EMAIL",
);
const privateKey = requireAdminEnv(
  process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  "FIREBASE_ADMIN_PRIVATE_KEY",
).replace(/\\n/g, "\n");

export const firebaseAdminApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });

export const adminAuth = getAuth(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);
export const adminStorage = getStorage(firebaseAdminApp);
