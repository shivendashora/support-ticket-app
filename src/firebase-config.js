import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDyMOsAKh_XYVFjxKcZ4AKgCaK7-wYGj4A",
  authDomain: "customersupport-d6b76.firebaseapp.com",
  projectId: "customersupport-d6b76",
  storageBucket: "customersupport-d6b76.firebasestorage.app",
  messagingSenderId: "813494580868",
  appId: "1:813494580868:web:fab9054f04c48e592334d1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
