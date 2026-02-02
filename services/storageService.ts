
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { EventItem, SocialLink, ProfileData } from '../types';
import { 
  FIREBASE_CONFIG, 
  INITIAL_PROFILE, 
  INITIAL_SOCIALS, 
  AUTH_KEY 
} from '../constants';

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

export const storageService = {
  getEvents: async (): Promise<EventItem[]> => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
  },

  getEventById: async (id: string): Promise<EventItem | undefined> => {
    const docRef = doc(db, 'events', id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } as EventItem : undefined;
  },

  saveEvent: async (event: Partial<EventItem>): Promise<void> => {
    if (event.id) {
      const { id, ...data } = event;
      await setDoc(doc(db, 'events', id), { ...data, updatedAt: Date.now() }, { merge: true });
    } else {
      const newDoc = doc(collection(db, 'events'));
      await setDoc(newDoc, { ...event, createdAt: Date.now() });
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'events', id));
  },

  getProfile: async (): Promise<ProfileData> => {
    const docRef = doc(db, 'config', 'profile');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() as ProfileData : INITIAL_PROFILE;
  },

  saveProfile: async (profile: ProfileData): Promise<void> => {
    await setDoc(doc(db, 'config', 'profile'), profile);
  },

  getSocialLinks: async (): Promise<SocialLink[]> => {
    const docRef = doc(db, 'config', 'socials');
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data().links as SocialLink[]) : INITIAL_SOCIALS;
  },

  saveSocialLinks: async (links: SocialLink[]): Promise<void> => {
    await setDoc(doc(db, 'config', 'socials'), { links });
  },

  login: (password: string): boolean => {
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
