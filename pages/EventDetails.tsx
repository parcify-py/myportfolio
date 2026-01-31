
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventItem, Language } from '../types';
import { storageService } from '../services/storageService';
import { PLACE_CONFIG, TRANSLATIONS, LANG_KEY } from '../constants';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [lang, setLang] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (id) {
      // Fix: storageService methods are async
      const fetchEvent = async () => {
        const found = await storageService.getEventById(id);
        if (found) setEvent(found);
        else navigate('/');
      };
      fetchEvent();
    }
    const handleLang = (e: any) => setLang(e.detail);
    window.addEventListener('langChange', handleLang);
    return () => window.removeEventListener('langChange', handleLang);
  }, [id, navigate]);

  if (!event) return null;
  const awardConfig = event.place ? PLACE_CONFIG[event.place] : null;
  const title = event.title[lang] || event.title['en'];
  const description = event.description[lang] || event.description['en'];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <button onClick={() => navigate(-1)} className="mb-8 md:mb-12 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span className="text-[10px] md:text-xs uppercase tracking-widest font-medium">{t.back}</span>
      </button>

      <div className="space-y-8 md:space-y-12">
        <header className="space-y-4 md:space-y-6 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-yellow-500 font-mono text-xs md:text-sm tracking-widest">{event.date}</span>
            {event.type === 'competition' && event.place && (
              <span className={`px-3 md:px-4 py-1 rounded-full border text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase ${awardConfig?.border} ${awardConfig?.text}`}>
                {t.competition} — {awardConfig?.label[lang]}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-7xl font-serif font-bold tracking-tighter leading-tight">
            {title}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 text-left">
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <div 
              className="text-zinc-300 leading-relaxed font-light text-lg md:text-xl prose prose-invert prose-yellow max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: description }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {event.images.map((img, idx) => (
                <div key={idx} className="aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">{t.summary}</h3>
              <ul className="space-y-4 text-xs md:text-sm">
                <li className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-zinc-500">{t.status}</span>
                  <span className="font-medium text-green-500">{t.completed}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-zinc-500">{t.eventType}</span>
                  <span className="font-medium capitalize">{event.type === 'competition' ? t.competition : t.standard}</span>
                </li>
                {event.place && (
                  <li className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-zinc-500">{t.ranking}</span>
                    <span className={`font-medium ${awardConfig?.text}`}>{awardConfig?.label[lang]}</span>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
