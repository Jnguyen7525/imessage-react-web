import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseMessaging";

export async function registerFCMToken(participantName: string) {
  if (!messaging) {
    console.warn("FCM messaging not initialized");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log("Service Worker registered:", registration);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_PUBLIC_KEY!,
      serviceWorkerRegistration: registration,
    });

    console.log("Registering FCM token for:", participantName);
    console.log("FCM token:", token);

    await fetch(
      `/api/store-fcm-token?user=${encodeURIComponent(participantName)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );
  } catch (err) {
    console.error("FCM registration failed", err);
  }
}

// import { messaging } from "./firebaseConfig";

// export async function registerFCMToken() {
//   try {
//     const token = await getToken(messaging, {
//       vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_PUBLIC_KEY,
//     });

//     // Send token to your backend to store it
//     await fetch("/api/store-fcm-token", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token }),
//     });

//     console.log("FCM token registered:", token);
//   } catch (err) {
//     console.error("FCM token registration failed", err);
//   }
// }
