// lib/fcm.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "YOUR_PROJECT_ID",
      clientEmail: "YOUR_CLIENT_EMAIL",
      privateKey: "YOUR_PRIVATE_KEY".replace(/\\n/g, "\n"),
    }),
  });
}

export async function sendFCM(token: string, data: Record<string, string>) {
  await admin.messaging().send({
    token,
    data,
  });
}
