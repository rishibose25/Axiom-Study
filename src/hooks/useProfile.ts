import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  age?: number;
  school?: string;
  ikigai?: string;
  classLevel?: string;
  syllabusStream?: string;
  streak: number;
  xp: number;
  level: number;
  dailyGoalMinutes: number;
  createdAt: any;
  updatedAt: any;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: auth.currentUser!.uid,
          displayName: auth.currentUser!.displayName || '',
          email: auth.currentUser!.email || '',
          photoURL: auth.currentUser!.photoURL || '',
          classLevel: 'Class 11',
          syllabusStream: 'NEET',
          streak: 0,
          xp: 0,
          level: 1,
          dailyGoalMinutes: 120,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        setDoc(docRef, initialProfile);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  return { profile, loading, updateProfile };
}
