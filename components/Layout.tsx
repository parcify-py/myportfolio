
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Language, SocialLink } from '../types';
import { TRANSLATIONS, LANG_KEY } from '../constants';
import { storageService } from '../services/storageService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const secretClickRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const fetchSocials = async () => {
      const data = await storageService.getSocialLinks();
      setSocials(data);
    };
    fetchSocials();

    const handleSocialUpdate = async () => {
      const data = await storageService.getSocialLinks();
      setSocials(data);
    };
    window.addEventListener('socialUpdate', handleSocialUpdate);
    return () => window.removeEventListener('socialUpdate', handleSocialUpdate);
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    window.dispatchEvent(new CustomEvent('langChange', { detail: lang }));
  }, [lang]);

  const handleSecretClick = () => {
    const now = Date.now();
    if (now - secretClickRef.current.lastTime > 1000) {
      secretClickRef.current.count = 1;
    } else {
      secretClickRef.current.count++;
    }
    secretClickRef.current.lastTime = now;

    if (secretClickRef.current.count >= 5) {
      navigate('/admin');
      secretClickRef.current.count = 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans selection:bg-yellow-500/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-2">
          <div 
            onClick={handleSecretClick}
            className="text-[10px] sm:text-sm md:text-xl font-serif font-bold tracking-tighter hover:text-white transition-colors truncate max-w-[150px] sm:max-w-none cursor-default select-none"
          >
            MAKAR SIMONOV<span className="text-yellow-500">.</span>PORTFOLIO
          </div>
          
          <div className="flex gap-1.5 sm:gap-4 md:gap-6 items-center">
            <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10">
              {(['en', 'ru', 'cs'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase transition-all ${lang === l ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 sm:gap-4 md:gap-8 items-center text-[8px] sm:text-[10px] md:text-xs font-medium tracking-wide uppercase">
              <Link to="/" className={`hover:text-yellow-500 transition-colors whitespace-nowrap ${location.pathname === '/' ? 'text-yellow-500' : 'text-zinc-400'}`}>
                {t.timeline}
              </Link>
              {storageService.isAuthenticated() && (
                <Link to="/admin" className={`px-2 sm:px-4 py-1 sm:py-2 border rounded-full border-yellow-500 text-yellow-500 transition-all whitespace-nowrap`}>
                  {t.dashboard}
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow pt-16 md:pt-20">
        {children}
      </main>

      <footer className="py-10 md:py-16 px-6 border-t border-white/5 text-center space-y-6 md:space-y-8 bg-black/30">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {socials.map(link => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-yellow-500 transition-colors"
            >
              {link.platform}
            </a>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="text-zinc-600 text-[8px] md:text-[10px] uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Makar Simonov. All rights reserved.</p>
          </div>
          <Link 
            to="/admin" 
            className="text-[8px] text-zinc-800 hover:text-zinc-500 transition-colors uppercase tracking-widest"
          >
            Admin Login
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
