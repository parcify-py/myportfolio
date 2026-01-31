
export type EventType = 'standard' | 'competition' | 'journey';
export type AwardPlace = 1 | 2 | 3;
export type Language = 'en' | 'ru' | 'cs';

export interface EventItem {
  id: string;
  title: Record<Language, string>;
  date: string;
  description: Record<Language, string>;
  images: string[];
  type: EventType;
  place?: AwardPlace;
  createdAt: number;
}

export interface ProfileItem {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  date: string;
  description: Record<Language, string>;
  images: string[];
}

export interface ProfileData {
  photos: string[];
  about: Record<Language, string>;
  education: ProfileItem[];
  skills: ProfileItem[];
  practice: ProfileItem[];
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface User {
  isLoggedIn: boolean;
}
