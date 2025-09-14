// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  //   apiKey: "YOUR_API_KEY",
  //   authDomain: "YOUR_PROJECT.firebaseapp.com",
  //   projectId: "YOUR_PROJECT_ID",
  //   storageBucket: "YOUR_PROJECT.appspot.com",
  //   messagingSenderId: "YOUR_SENDER_ID",
  //   appId: "YOUR_APP_ID",
  apiKey: "AIzaSyCJy0HEX1pLF0t-PYz39fpZkvtI6Z5jpBU",
  authDomain: "imessage-react-cl.firebaseapp.com",
  projectId: "imessage-react-cl",
  storageBucket: "imessage-react-cl.firebasestorage.app",
  messagingSenderId: "1066221674094",
  appId: "1:1066221674094:web:4e30171b182e1bd6a6d07f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.data?.callerName || "Incoming Call";
  const notificationOptions = {
    body: "Tap to join the call",
    icon: "/icon.png", // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
