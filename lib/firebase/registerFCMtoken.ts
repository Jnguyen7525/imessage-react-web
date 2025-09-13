import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

export async function registerFCMToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.FIREBASE_VAPID_PUBLIC_KEY,
    });

    // Send token to your backend to store it
    await fetch("/api/store-fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    console.log("FCM token registered:", token);
  } catch (err) {
    console.error("FCM token registration failed", err);
  }
}
