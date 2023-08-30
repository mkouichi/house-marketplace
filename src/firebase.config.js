// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB5xdCZZ6lnKYCBQVUsC0lqK7BixCtZB5M',
  authDomain: 'house-marketplace-app-f5b23.firebaseapp.com',
  projectId: 'house-marketplace-app-f5b23',
  storageBucket: 'house-marketplace-app-f5b23.appspot.com',
  messagingSenderId: '241458545857',
  appId: '1:241458545857:web:75c06c3d4d2a137078c040',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
