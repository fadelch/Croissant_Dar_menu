import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

function requireEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readUid() {
  const args = process.argv.slice(2);

  if (args.length !== 1 || args[0].trim().length === 0 || args[0].length > 128) {
    throw new Error(
      "Usage: node --env-file=.env.local scripts/bootstrap-admin.mjs <firebase-user-uid>",
    );
  }

  return args[0].trim();
}

async function bootstrapAdmin() {
  const uid = readUid();
  const projectId = requireEnvironmentVariable("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = requireEnvironmentVariable("FIREBASE_ADMIN_CLIENT_EMAIL");
  const privateKey = requireEnvironmentVariable("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = await auth.getUser(uid);

  if (!user.email) {
    throw new Error("The Firebase user must have an email address.");
  }

  const adminDocument = db.collection("admins").doc(uid);
  const existingDocument = await adminDocument.get();
  const existingCreatedAt = existingDocument.get("createdAt");
  const createdAt = existingCreatedAt instanceof Timestamp ? existingCreatedAt : FieldValue.serverTimestamp();
  const profile = {
    email: user.email,
    role: "admin",
    createdAt,
    updatedAt: FieldValue.serverTimestamp(),
    ...(user.displayName ? { displayName: user.displayName } : {}),
  };

  await adminDocument.set(profile, { merge: true });
  await auth.setCustomUserClaims(uid, {
    ...(user.customClaims ?? {}),
    admin: true,
  });

  console.log("Admin claim successfully assigned.");
  console.log(`Email: ${user.email}`);
  console.log(`UID: ${uid}`);
  console.log("Sign out and sign in again so Firebase issues a token with the new claim.");
}

bootstrapAdmin().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";

  console.error(`Admin bootstrap failed: ${message}`);
  process.exitCode = 1;
});
