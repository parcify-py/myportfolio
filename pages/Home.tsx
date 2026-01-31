
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventItem, Language, ProfileData } from '../types';
import { storageService } from '../services/storageService';
import { TRANSLATIONS, LANG_KEY, INITIAL_PROFILE, IS_FIREBASE_CONFIGURED } from '../constants';
import AwardFrame from '../components/AwardFrame';

const Home: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!IS_FIREBASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const [evs, prof] = await Promise.all([
        storageService.getEvents(),
        storageService.getProfile()
      ]);
      setEvents(evs);
      setProfile(prof);
      setLoading(false);
    };
    fetchData();
    const handleLang = (e: any) => setLang(e.detail);
    window.addEventListener('langChange', handleLang);
    return () => window.removeEventListener('langChange', handleLang);
  }, []);

  if (!IS_FIREBASE_CONFIGURED) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚙️</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-serif font-bold text-red-500">{t.configRequired}</h1>
        <p className="max-w-md text-zinc-400 text-sm md:text-base leading-relaxed">
          To enable live data saving, please go to <code className="bg-white/10 px-2 py-1 rounded">constants.ts</code> and enter your Firebase project credentials.
        </p>
        <div className="pt-8 text-[10px] uppercase tracking-widest text-zinc-600">
          Portfolio by Makar Simonov
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.4em] text-yellow-500 animate-pulse">{t.loading}</div>
      </div>
    );
  }

  const ProfileColumn = ({ title, items, category }: { title: string, items: any[], category: string }) => (
    <div className="flex-1 space-y-6">
      <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-yellow-500 border-b border-white/5 pb-4 mb-2">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map(item => (
          <Link 
            key={item.id} 
            to={`/profile/${category}/${item.id}`}
            className="block group p-4 bg-zinc-900/40 border border-white/5 rounded-2xl hover:border-yellow-500/30 hover:bg-zinc-800/50 transition-all duration-500 text-left"
          >
            <div className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-mono mb-1">{item.date}</div>
            <h4 className="text-sm md:text-base font-bold group-hover:text-yellow-500 transition-colors leading-snug">
              {item.title[lang] || item.title['en']}
            </h4>
            <div className="text-[10px] md:text-xs text-zinc-400 mt-1 font-light opacity-80">
              {item.subtitle[lang] || item.subtitle['en']}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 relative min-h-screen">
      
      {/* Profile Section */}
      <section className="mb-24 md:mb-40">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start mb-20">
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-500 to-amber-200 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-zinc-900 rounded-3xl overflow-hidden aspect-square w-64 md:w-80 shadow-2xl border border-white/5">
                <img 
                  src={profile.photos[0] || 'https://picsum.photos/seed/me/600/600'} 
                  alt="Profile" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-2/3 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-tight">
              {profile.about[lang] || profile.about['en']}
            </h1>
          </div>
        </div>

        {/* Dynamic Categories Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 xl:gap-12">
          <ProfileColumn title={t.education} items={profile.education} category="education" />
          <ProfileColumn title={t.skills} items={profile.skills} category="skills" />
          <ProfileColumn title={t.practice} items={profile.practice} category="practice" />
        </div>
      </section>

      {/* Timeline Section */}
      <div className="relative mt-32 md:mt-60">
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-white/20 to-transparent -translate-x-1/2"></div>

        <div className="space-y-16 md:space-y-32 relative">
          {events.map((event, index) => {
            const isLeft = index % 2 === 0;
            const title = event.title[lang] || event.title['en'];
            const description = event.description[lang] || event.description['en'];

            const CardContent = (
              <Link to={`/event/${event.id}`} className="block group">
                <div className="space-y-3 md:space-y-4">
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-zinc-900 border border-white/5 relative shadow-xl md:shadow-2xl">
                    <img 
                      src={event.images[0] || 'https://picsum.photos/seed/placeholder/800/600'} 
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {event.type === 'journey' && (
                      <div className="absolute top-3 right-3 bg-blue-500/80 backdrop-blur-md text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        {t.journey}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase py-2 px-4 md:px-6 border border-white/50 rounded-full">
                        {t.viewDetails}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 md:space-y-2 px-1 text-left">
                    <div className="text-yellow-500 text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em]">{event.date}</div>
                    <h2 className="text-lg md:text-3xl font-serif font-bold group-hover:text-yellow-500 transition-colors leading-tight tracking-tight">
                      {title}
                    </h2>
                    <div 
                      className="text-zinc-400 text-[11px] md:text-sm line-clamp-2 md:line-clamp-3 font-light leading-relaxed opacity-80"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  </div>
                </div>
              </Link>
            );

            return (
              <div key={event.id} className="relative flex flex-col md:flex-row items-center md:items-start">
                <div className={`w-full md:w-1/2 flex justify-center ${isLeft ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16 md:order-last'}`}>
                  <div className="w-full max-w-lg">
                    {event.type === 'competition' && event.place ? (
                      <AwardFrame place={event.place}>
                        <div className="p-0.5 md:p-1">{CardContent}</div>
                      </AwardFrame>
                    ) : (
                      <div className={`p-0.5 md:p-1 rounded-2xl ${event.type === 'journey' ? 'border border-blue-500/10' : ''}`}>{CardContent}</div>
                    )}
                  </div>
                </div>

                <div className="absolute left-1/2 top-0 md:top-10 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 items-center justify-center flex z-10">
                  <div className={`w-2.5 h-2.5 md:w-2 md:h-2 rounded-full ring-4 ring-black transition-all duration-500 ${
                    event.type === 'competition' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)] ring-yellow-500/20' : 
                    event.type === 'journey' ? 'bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] ring-blue-500/20' :
                    'bg-zinc-600 ring-white/5'
                  }`}></div>
                </div>

                <div className="hidden md:block md:w-1/2"></div>
              </div>
            );
          })}
        </div>
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-40">
          <h2 className="text-xl md:text-4xl font-serif text-zinc-700 font-bold italic">{t.empty}</h2>
        </div>
      )}
    </div>
  );
};

export default Home;
