
import React, { useState, useEffect } from 'react';
import { AwardPlace, Language } from '../types';
import { PLACE_CONFIG, LANG_KEY } from '../constants';

interface AwardFrameProps {
  place: AwardPlace;
  children: React.ReactNode;
}

const AwardFrame: React.FC<AwardFrameProps> = ({ place, children }) => {
  const [lang, setLang] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const config = PLACE_CONFIG[place];

  useEffect(() => {
    const handleLang = (e: any) => setLang(e.detail);
    window.addEventListener('langChange', handleLang);
    return () => window.removeEventListener('langChange', handleLang);
  }, []);

  return (
    <div className={`relative p-1 rounded-2xl bg-gradient-to-br ${config.color} ${config.shadow} transition-all duration-500`}>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black text-[10px] font-bold tracking-[0.2em] uppercase border border-white/10 z-10 whitespace-nowrap">
        <span className={`bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
          {config.label[lang]}
        </span>
      </div>
      <div className="bg-[#111] rounded-[calc(1rem-4px)] overflow-hidden h-full">
        {children}
      </div>
    </div>
  );
};

export default AwardFrame;
