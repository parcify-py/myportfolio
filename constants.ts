
import { EventItem, Language, SocialLink, ProfileData } from './types';

export const STORAGE_KEY = 'portfolio_events';
export const PROFILE_KEY = 'portfolio_profile';
export const SOCIAL_KEY = 'portfolio_social';
export const AUTH_KEY = 'portfolio_auth_token';
export const LANG_KEY = 'portfolio_lang';

/**
 * ВАЖНО: Вставьте сюда свои ключи из консоли Firebase (Settings -> Your Apps)
 */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBlnISF-qyZ0nLTUhN3mM7TDrR6ITjatbI",
  authDomain: "portfolio-d96c0.firebaseapp.com",
  projectId: "portfolio-d96c0",
  storageBucket: "portfolio-d96c0.firebasestorage.app",
  messagingSenderId: "214874585148",
  appId: "1:214874585148:web:7d584b888c5fc594c3ab39",
  measurementId: "G-R1T5ESY2L5"
};

// Проверка, заполнены ли ключи
export const IS_FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

export const INITIAL_PROFILE: ProfileData = {
  photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'],
  about: {
    en: 'Expert Full-stack Developer & UI/UX Designer specialized in building high-end digital experiences.',
    ru: 'Эксперт Full-stack разработчик и UI/UX дизайнер, специализирующийся на создании высококлассных цифровых продуктов.',
    cs: 'Expertní Full-stack vývojář a UI/UX designér specializující se na tvorbu špičkových digitálních zážitků.'
  },
  education: [],
  skills: [],
  practice: []
};

export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_SOCIALS: SocialLink[] = [
  { id: '1', platform: 'GitHub', url: 'https://github.com' },
  { id: '2', platform: 'LinkedIn', url: 'https://linkedin.com' }
];

export const PLACE_CONFIG = {
  1: {
    label: { en: '1st Place', ru: '1 место', cs: '1. místo' },
    color: 'from-yellow-400 via-amber-200 to-yellow-600',
    border: 'border-yellow-500/50',
    shadow: 'shadow-[0_0_25px_-5px_rgba(234,179,8,0.4)]',
    text: 'text-yellow-400'
  },
  2: {
    label: { en: '2nd Place', ru: '2 место', cs: '2. místo' },
    color: 'from-slate-300 via-zinc-100 to-slate-500',
    border: 'border-slate-400/50',
    shadow: 'shadow-[0_0_25px_-5px_rgba(203,213,225,0.4)]',
    text: 'text-slate-300'
  },
  3: {
    label: { en: '3rd Place', ru: '3 место', cs: '3. místo' },
    color: 'from-orange-700 via-orange-400 to-orange-900',
    border: 'border-orange-800/50',
    shadow: 'shadow-[0_0_25px_-5px_rgba(194,65,12,0.4)]',
    text: 'text-orange-600'
  }
};

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    timeline: 'Timeline',
    dashboard: 'Dashboard',
    viewDetails: 'View Details',
    back: 'Back',
    summary: 'Summary',
    status: 'Status',
    completed: 'Completed',
    eventType: 'Event Type',
    ranking: 'Ranking',
    adminAccess: 'Admin Access',
    password: 'Password',
    authenticate: 'Authenticate',
    manageEvents: 'Manage Events',
    createEvent: 'Create Event',
    logout: 'Logout',
    edit: 'Edit',
    delete: 'Delete',
    title: 'Title',
    subtitle: 'Subtitle / Org',
    date: 'Date / Period',
    type: 'Type',
    standard: 'Standard Event',
    competition: 'Competition',
    journey: 'Journey',
    place: 'Place (Ranking)',
    description: 'Description',
    images: 'Images',
    upload: 'Upload',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure?',
    empty: 'The timeline is empty.',
    socials: 'Social Links',
    addSocial: 'Add Link',
    platform: 'Platform',
    url: 'URL',
    richTextNote: 'HTML tags: <b>bold</b>, <i>italic</i>, <a href="...">links</a>.',
    profileSettings: 'Profile Settings',
    education: 'Education',
    skills: 'Skills',
    practice: 'Work Experience',
    aboutMe: 'About Me',
    profile: 'Profile',
    events: 'Events',
    addItem: 'Add Item',
    loading: 'Loading Experience...',
    configRequired: 'Firebase Configuration Required'
  },
  ru: {
    timeline: 'Хроника',
    dashboard: 'Панель',
    viewDetails: 'Подробнее',
    back: 'Назад',
    summary: 'Сводка',
    status: 'Статус',
    completed: 'Завершено',
    eventType: 'Тип события',
    ranking: 'Место',
    adminAccess: 'Вход',
    password: 'Пароль',
    authenticate: 'Войти',
    manageEvents: 'Управление',
    createEvent: 'Добавить событие',
    logout: 'Выйти',
    edit: 'Ред.',
    delete: 'Удалить',
    title: 'Заголовок',
    subtitle: 'Организация / Подзаголовок',
    date: 'Дата / Период',
    type: 'Тип',
    standard: 'Мероприятие',
    competition: 'Соревнование',
    journey: 'Путешествие',
    place: 'Занятое место',
    description: 'Описание',
    images: 'Изображения',
    upload: 'Загрузить',
    save: 'Сохранить',
    cancel: 'Отмена',
    confirmDelete: 'Вы уверены?',
    empty: 'Пусто.',
    socials: 'Соцсети',
    addSocial: 'Добавить ссылку',
    platform: 'Платформа',
    url: 'Ссылка',
    richTextNote: 'HTML: <b>жирный</b>, <i>курсив</i>, <a href="...">ссылка</a>.',
    profileSettings: 'Профиль',
    education: 'Образование',
    skills: 'Навыки',
    practice: 'Опыт работы',
    aboutMe: 'Обо мне',
    profile: 'Профиль',
    events: 'События',
    addItem: 'Добавить',
    loading: 'Загрузка...',
    configRequired: 'Требуется настройка Firebase'
  },
  cs: {
    timeline: 'Časová osa',
    dashboard: 'Panel',
    viewDetails: 'Více',
    back: 'Zpět',
    summary: 'Shrnutí',
    status: 'Stav',
    completed: 'Dokončeno',
    eventType: 'Typ',
    ranking: 'Umístění',
    adminAccess: 'Vstup',
    password: 'Heslo',
    authenticate: 'Přihlásit se',
    manageEvents: 'Správa',
    createEvent: 'Vytvořit',
    logout: 'Odhlásit se',
    edit: 'Upravit',
    delete: 'Smazat',
    title: 'Název',
    subtitle: 'Organizace / Podnázev',
    date: 'Datum / Období',
    type: 'Typ',
    standard: 'Událost',
    competition: 'Soutěž',
    journey: 'Cesta',
    place: 'Místo',
    description: 'Popis',
    images: 'Obrázky',
    upload: 'Nahrát',
    save: 'Uložit',
    cancel: 'Zrušit',
    confirmDelete: 'Smazat?',
    empty: 'Zatím prázdné.',
    socials: 'Sítě',
    addSocial: 'Přidat odkaz',
    platform: 'Platforma',
    url: 'URL',
    richTextNote: 'HTML tagy: <b>tučné</b>, <i>kurzíva</i>, <a href="...">odkaz</a>.',
    profileSettings: 'Profil',
    education: 'Vzdělání',
    skills: 'Dovednosti',
    practice: 'Praxe',
    aboutMe: 'O mně',
    profile: 'Profil',
    events: 'Události',
    addItem: 'Přidat',
    loading: 'Načítání...',
    configRequired: 'Je vyžadována konfigurace Firebase'
  }
};
