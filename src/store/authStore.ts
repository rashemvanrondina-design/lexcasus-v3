// store/authStore.ts
import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Config/firebase';
import type { User } from '../types';

const ADMIN_EMAIL = 'rashemvanrondina@gmail.com';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  initialize: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// 🔹 Helper: fetch Firestore user
async function fetchFirestoreUserData(fbUser: FirebaseUser): Promise<User> {
  const userDocRef = doc(db, 'users', fbUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      isAdmin: data.isAdmin || fbUser.email === ADMIN_EMAIL,
      planTier: data.planTier || 'free',
      trialExpired: data.trialExpired || false,
    };
  }

  // fallback
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    isAdmin: fbUser.email === ADMIN_EMAIL,
    planTier: 'free',
    trialExpired: false,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: false,
  error: null,
  initialized: false,

  // ✅ Initialize auth listener (safe)
  initialize: () => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted) return;

      try {
        if (fbUser) {
          const fullUser = await fetchFirestoreUserData(fbUser);
          if (!isMounted) return;

          set({
            user: fullUser,
            firebaseUser: fbUser,
            initialized: true,
            error: null,
          });
        } else {
          set({
            user: null,
            firebaseUser: null,
            initialized: true,
            error: null,
          });
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Auth initialization failed';
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  },

  // ✅ Email login
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fullUser = await fetchFirestoreUserData(credential.user);

      set({
        user: fullUser,
        firebaseUser: credential.user,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Signup
  signup: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(credential.user, { displayName });

      // Create Firestore doc
      await setDoc(doc(db, 'users', credential.user.uid), {
        email: credential.user.email,
        displayName,
        planTier: 'free',
        trialExpired: false,
        isAdmin: credential.user.email === ADMIN_EMAIL,
        createdAt: Date.now(),
      });

      const fullUser = await fetchFirestoreUserData(credential.user);

      set({
        user: fullUser,
        firebaseUser: credential.user,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Signup failed. Please try again.';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Google Login
  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);

      const userDocRef = doc(db, 'users', credential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: credential.user.email,
          displayName: credential.user.displayName,
          planTier: 'free',
          trialExpired: false,
          isAdmin: credential.user.email === ADMIN_EMAIL,
          createdAt: Date.now(),
        });
      }

      const fullUser = await fetchFirestoreUserData(credential.user);

      set({
        user: fullUser,
        firebaseUser: credential.user,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Google login failed.';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Logout
  logout: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, firebaseUser: null, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Logout failed.';
      set({ error: message });
    }
  },

  // ✅ Clear errors
  clearError: () => set({ error: null }),
}));