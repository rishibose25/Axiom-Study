import { useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp,
  collection
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface ChapterProgress {
  chapterId: string;
  completedTopics: string[];
  updatedAt?: any;
}

export function useSyllabusProgress() {
  const [progress, setProgress] = useState<Record<string, ChapterProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = `users/${auth.currentUser.uid}/syllabus_progress`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const progMap: Record<string, ChapterProgress> = {};
      snapshot.docs.forEach(doc => {
        progMap[doc.id] = {
          chapterId: doc.id,
          ...doc.data()
        } as ChapterProgress;
      });
      setProgress(progMap);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const toggleTopic = async (chapterId: string, topic: string) => {
    if (!auth.currentUser) return;

    const current = progress[chapterId] || { chapterId, completedTopics: [] };
    let newCompleted = [...current.completedTopics];

    if (newCompleted.includes(topic)) {
      newCompleted = newCompleted.filter(t => t !== topic);
    } else {
      newCompleted.push(topic);
    }

    const docRef = doc(db, `users/${auth.currentUser.uid}/syllabus_progress`, chapterId);
    await setDoc(docRef, {
      completedTopics: newCompleted,
      updatedAt: serverTimestamp()
    });
  };

  return { progress, toggleTopic, loading };
}
