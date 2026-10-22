/* eslint-disable no-undef */
// MilliyGo brauzer push (FCM) service worker. Sozlama URL parametrlaridan olinadi:
//   /firebase-messaging-sw.js?apiKey=...&projectId=...&messagingSenderId=...&appId=...
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js')

const params = new URL(self.location.href).searchParams
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})
const messaging = firebase.messaging()

// Backend `notification` bilan yuboradi — brauzer o'zi ko'rsatadi. Faqat data keladigan xabarlar uchun:
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return
  const data = payload.data || {}
  self.registration.showNotification(data.title || 'MilliyGo', {
    body: data.body || '',
    icon: '/favicon.ico',
    data,
  })
})

// Bosilganda yo'naltirishni FCM SDK o'zi bajaradi: backend har xabarga webpush.fcm_options.link qo'shadi
// (buyurtma bo'lsa /orders/track/?uuid=..., aks holda bosh sahifa).
