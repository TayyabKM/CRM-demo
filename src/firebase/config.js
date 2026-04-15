/*
PASTE THESE INTO FIREBASE CONSOLE → FIRESTORE → RULES:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/
        $(request.auth.uid)).data.role == 'superadmin';
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnl5Fj2ODIbhXsk81lXXtqOCvoZFr71tw",
  authDomain: "brandline-ai.firebaseapp.com",
  projectId: "brandline-ai",
  storageBucket: "brandline-ai.firebasestorage.app",
  messagingSenderId: "229552711009",
  appId: "1:229552711009:web:d614a3f45e21dc83a45120"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
