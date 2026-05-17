import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Chat {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  lastMessage?: string;
  createdAt: any;
  updatedAt: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  feedback?: 'up' | 'down' | null;
  createdAt: any;
  functionCalls?: any[];
}

export function useAiTutor() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch chats
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      setChats(chatsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, `chats/${activeChatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(messagesData);
    });

    return unsubscribe;
  }, [activeChatId]);

  const createChat = async (title: string, subject?: string) => {
    if (!auth.currentUser) return null;
    
    const newChat = {
      userId: auth.currentUser.uid,
      title,
      subject: subject || 'General',
      lastMessage: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'chats'), newChat);
    setActiveChatId(docRef.id);
    return docRef.id;
  };

  const sendMessage = async (chatId: string, content: string, role: 'user' | 'model', functionCalls?: any[]) => {
    if (!auth.currentUser) return;

    const msg = {
      role,
      content,
      createdAt: serverTimestamp(),
      functionCalls: functionCalls || null
    };

    await addDoc(collection(db, `chats/${chatId}/messages`), msg);
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: content.substring(0, 50),
      updatedAt: serverTimestamp()
    });
  };

  const deleteChat = async (chatId: string) => {
    await deleteDoc(doc(db, 'chats', chatId));
    if (activeChatId === chatId) setActiveChatId(null);
  };

  const updateMessageFeedback = async (chatId: string, messageId: string, feedback: 'up' | 'down' | null) => {
    await updateDoc(doc(db, `chats/${chatId}/messages`, messageId), { feedback });
  };

  const renameChat = async (chatId: string, title: string) => {
    await updateDoc(doc(db, 'chats', chatId), { title });
  };

  return {
    chats,
    activeChatId,
    setActiveChatId,
    messages,
    loading,
    createChat,
    sendMessage,
    deleteChat,
    updateMessageFeedback,
    renameChat
  };
}
