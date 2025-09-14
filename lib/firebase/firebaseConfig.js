// // Initialize Firebase for the frontend (Client-Side)
// import { getMessaging, getToken, onMessage } from "@firebase/messaging";
// import { initializeApp } from "firebase/app";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

// // Ensure to initialize Firebase only when in the client-side
// let messaging;
// if (typeof window !== "undefined" && "navigator" in window) {
//   const app = initializeApp(firebaseConfig);
//   messaging = getMessaging(app);
// }

// export { messaging, getToken, onMessage };

// Import the functions you need from the SDKs you need
import { getMessaging } from "firebase/messaging";
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;

// export const messaging = getMessaging(app);
