import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

export async function registerFCMToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BP7i75CMcjM-vHfVd0B8TD4y6eUKnycz1zNrvah7eBMkJETIHscxhOT_cqea_GvB9zE3NqvidBxfQT8ZRJUVu3k",
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
