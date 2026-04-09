import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyS6DRfTtikLZlaZcPaaVfJ3EGQ96dK5Y",
  authDomain: "billing-wifi-c7b1c.firebaseapp.com",
  projectId: "billing-wifi-c7b1c",
  storageBucket: "billing-wifi-c7b1c.firebasestorage.app",
  messagingSenderId: "79736396143",
  appId: "1:79736396143:web:6832a907dffce938adb09a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
