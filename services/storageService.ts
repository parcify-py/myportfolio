
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { EventItem, SocialLink, ProfileData } from '../types';
import { FIREBASE_CONFIG, AUTH_KEY, INITIAL_EVENTS, INITIAL_PROFILE, INITIAL_SOCIALS } from '../constants';

// Инициализация Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const EVENTS_COL = 'events';
const PROFILE_DOC = 'profile/main';
const SOCIALS_DOC = 'socials/main';

export const storageService = {
  getEvents: async (): Promise<EventItem[]> => {
    try {
      const q = query(collection(db, EVENTS_COL), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as EventItem));
      return events;
    } catch (e) {
      console.error("Firebase error (events):", e);
      return [];
    }
  },

  getEventById: async (id: string): Promise<EventItem | undefined> => {
    try {
      const d = await getDoc(doc(db, EVENTS_COL, id));
      return d.exists() ? { ...d.data(), id: d.id } as EventItem : undefined;
    } catch (e) {
      return undefined;
    }
  },

  saveEvent: async (event: Partial<EventItem>): Promise<void> => {
    try {
      const id = event.id || Math.random().toString(36).substr(2, 9);
      const data = {
        ...event,
        id,
        createdAt: event.createdAt || Date.now()
      };
      await setDoc(doc(db, EVENTS_COL, id), data);
    } catch (e) {
      console.error("Save error:", e);
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, EVENTS_COL, id));
  },

  getProfile: async (): Promise<ProfileData> => {
    try {
      const d = await getDoc(doc(db, PROFILE_DOC));
      return d.exists() ? d.data() as ProfileData : INITIAL_PROFILE;
    } catch (e) {
      return INITIAL_PROFILE;
    }
  },

  saveProfile: async (profile: ProfileData): Promise<void> => {
    await setDoc(doc(db, PROFILE_DOC), profile);
  },

  getSocialLinks: async (): Promise<SocialLink[]> => {
    try {
      const d = await getDoc(doc(db, SOCIALS_DOC));
      return d.exists() ? (d.data() as any).links : INITIAL_SOCIALS;
    } catch (e) {
      return INITIAL_SOCIALS;
    }
  },

  saveSocialLinks: async (links: SocialLink[]): Promise<void> => {
    await setDoc(doc(db, SOCIALS_DOC), { links });
  },

  login: (password: string): boolean => {
    // В реальности здесь должна быть Firebase Auth, но для простоты оставим пароль в коде
    if (password === 'N1n5kkS2') {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_KEY);
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }
};
