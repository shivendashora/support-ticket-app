import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Function to register a new user and store their data in Firestore
export const registerUser = async (email, password, username, userType) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    username,
    email,
    userType,
  });

  return user;
};

// Function to log in an existing user
export const loginUser = async (email, password) => {
  try {
    console.log("Logging in with:", email, password);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Login failed:", error.code, error.message);
    throw error;
  }
};

