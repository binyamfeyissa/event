import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Event } from '../types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      await addDoc(collection(db, 'events'), eventData);
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, data: Partial<Event>) => {
    try {
      await updateDoc(doc(db, 'events', id), data);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  return { events, loading, addEvent, updateEvent };
};