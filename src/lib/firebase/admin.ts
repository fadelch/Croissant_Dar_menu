import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

function requireAdminEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required Firebase Admin environment variable: ${name}`);
  }

  return value;
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = requireAdminEnv(
    process.env.FIREBASE_ADMIN_PROJECT_ID,
    "FIREBASE_ADMIN_PROJECT_ID",
  );
  const clientEmail = requireAdminEnv(
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    "FIREBASE_ADMIN_CLIENT_EMAIL",
  );
  const privateKey = requireAdminEnv(
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ).replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getFirebaseAdminApp());
}
