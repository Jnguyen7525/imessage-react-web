import { getMessaging, Messaging } from "firebase/messaging";
import app from "./firebaseConfig";

let messaging: Messaging | undefined;

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  messaging = getMessaging(app);
}

export { messaging };
