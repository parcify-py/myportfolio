
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileItem, Language, ProfileData } from '../types';
import { storageService } from '../services/storageService';
import { TRANSLATIONS, LANG_KEY } from '../constants';

const ProfileItemDetails: React.FC = () => {
  const { category, id } = useParams<{ category: string, id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ProfileItem | null>(null);
  const [lang, setLang] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (category && id) {
      const fetchProfileItem = async () => {
        const profile = await storageService.getProfile();
        const collection = (profile as any)[category] as ProfileItem[];
        const found = collection?.find(i => i.id === id);
        if (found) setItem(found);
        else navigate('/');
      };
      fetchProfileItem();
    }
    const handleLang = (e: any) => setLang(e.detail);
    window.addEventListener('langChange', handleLang);
    return () => window.removeEventListener('langChange', handleLang);
  }, [category, id, navigate]);

  const handleDelete = async () => {
    if (category && id && window.confirm(t.confirmDelete)) {
      const profile = await storageService.getProfile();
      const key = category as keyof ProfileData;
      const collection = (profile[key] as ProfileItem[]).filter(i => i.id !== id);
      await storageService.saveProfile({ ...profile, [key]: collection });
      navigate('/');
    }
  };

  if (!item) return null;
  const title = item.title[lang] || item.title['en'];
  const subtitle = item.subtitle[lang] || item.subtitle['en'];
  const description = item.description[lang] || item.description['en'];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-start mb-8 md:mb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold">{t.back}</span>
        </button>
        {storageService.isAuthenticated() && (
          <button onClick={handleDelete} className="px-4 py-2 bg-red-900/20 text-red-500 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-red-900/40 transition-all">
            {t.delete} Item
          </button>
        )}
      </div>

      <div className="space-y-8 md:space-y-12">
        <header className="space-y-4 text-left">
          <div className="flex flex-col gap-2">
            <span className="text-yellow-500 font-mono text-xs md:text-sm tracking-[0.2em] uppercase">{item.date}</span>
            <span className="text-zinc-500 text-[9px] md:text-[11px] font-bold tracking-[0.3em] uppercase">{category}</span>
          </div>
          <h1 className="text-3xl md:text-7xl font-serif font-bold tracking-tighter leading-tight">{title}</h1>
          <p className="text-lg md:text-2xl text-zinc-400 font-light border-l-2 border-yellow-500/50 pl-6 italic">{subtitle}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 text-left pt-12 border-t border-white/5">
          <div className="lg:col-span-8 space-y-12">
            <div className="text-zinc-300 leading-relaxed font-light text-lg md:text-xl prose prose-invert prose-yellow max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: description }} />
            {item.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {item.images.map((img, idx) => (
                  <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileItemDetails;
