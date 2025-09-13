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
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJy0HEX1pLF0t-PYz39fpZkvtI6Z5jpBU",
  authDomain: "imessage-react-cl.firebaseapp.com",
  projectId: "imessage-react-cl",
  storageBucket: "imessage-react-cl.firebasestorage.app",
  messagingSenderId: "1066221674094",
  appId: "1:1066221674094:web:4e30171b182e1bd6a6d07f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
