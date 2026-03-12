import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  username: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential;
};

export const updateDisplayName = async (displayName: string) => {
  if (!auth.currentUser) throw new Error('No user logged in');
  await updateProfile(auth.currentUser, { displayName });
};

export const logoutUser = async () => {
  return await signOut(auth);
};