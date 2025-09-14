// // public/firebase-messaging-sw.js
// importScripts(
//   "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
// );

// firebase.initializeApp({
//   apiKey: "AIzaSyCJy0HEX1pLF0t-PYz39fpZkvtI6Z5jpBU",
//   authDomain: "imessage-react-cl.firebaseapp.com",
//   projectId: "imessage-react-cl",
//   storageBucket: "imessage-react-cl.firebasestorage.app",
//   messagingSenderId: "1066221674094",
//   appId: "1:1066221674094:web:4e30171b182e1bd6a6d07f",
// });

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function (payload) {
//   console.log(
//     "[firebase-messaging-sw.js] Received background message ",
//     payload
//   );
//   const notificationTitle = payload.data?.callerName || "Incoming Call";
//   const notificationOptions = {
//     body: "Tap to join the call",
//     icon: "/icon.png", // optional
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
//   // ✅ Forward payload to all open tabs
//   self.clients
//     .matchAll({ type: "window", includeUncontrolled: true })
//     .then((clients) => {
//       for (const client of clients) {
//         console.log("[SW] Posting message to client:", client);
//         client.postMessage({
//           type: payload.data?.type || "unknown",
//           payload: payload.data,
//         });
//       }
//     });
// });

// public/firebase-messaging-sw.js

// Import Firebase libraries for service worker compatibility
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
);

// Initialize Firebase app inside the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCJy0HEX1pLF0t-PYz39fpZkvtI6Z5jpBU",
  authDomain: "imessage-react-cl.firebaseapp.com",
  projectId: "imessage-react-cl",
  storageBucket: "imessage-react-cl.firebasestorage.app",
  messagingSenderId: "1066221674094",
  appId: "1:1066221674094:web:4e30171b182e1bd6a6d07f",
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background FCM messages
messaging.onBackgroundMessage(function (payload) {
  console.log("[SW] ✅ Background message received:", payload);

  // Optional: Show a notification for incoming calls
  const notificationTitle = payload.data?.callerName || "Incoming Call";
  const notificationOptions = {
    body: "Tap to join the call",
    icon: "/icon.png", // Customize this icon if needed
  };

  // Show browser notification
  self.registration.showNotification(notificationTitle, notificationOptions);

  // ✅ Forward the payload to all open tabs
  self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      if (clients.length === 0) {
        console.warn("[SW] No active clients to forward message to.");
      }

      for (const client of clients) {
        console.log("[SW] 🔁 Forwarding message to client:", client);

        client.postMessage({
          type: payload.data?.type || "unknown",
          payload: payload.data,
        });
      }
    });
});
