import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface TestRecord {
  id: string;
  userId: string;
  title: string;
  subject: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number;
  date: string;
  reflections: string;
  aiInsights: string;
  createdAt: any;
}

export function useTestLog() {
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tests'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TestRecord[];
      setTestRecords(records);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tests');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTestRecord = async (record: Omit<TestRecord, 'id' | 'userId' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'tests'), {
        ...record,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tests');
    }
  };

  return { testRecords, loading, addTestRecord };
}
