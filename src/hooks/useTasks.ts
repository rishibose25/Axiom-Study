import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectId: string;
  scheduledDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  duration: number;
  type: 'study' | 'revision';
  completedAt?: any;
  createdAt: any;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (task: Partial<Task>) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ...task,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        isCompleted: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  return { tasks, loading, addTask, updateTask };
}
