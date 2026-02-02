
import React, { useEffect, useState, useRef } from 'react';
import { storageService } from '../services/storageService';
import { EventItem, EventType, AwardPlace, Language, SocialLink, ProfileData, ProfileItem } from '../types';
import { TRANSLATIONS, LANG_KEY, INITIAL_PROFILE } from '../constants';

const ProfileListManager = ({ category, items, lang, t, onEdit, onCreate, onDelete }: any) => (
  <div className="space-y-4 text-left">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500">{t[category]}</h3>
      <button 
        type="button"
        onClick={onCreate}
        className="px-4 py-1.5 bg-yellow-500 text-black text-[9px] font-bold rounded-full uppercase tracking-tighter hover:bg-yellow-400 transition-colors"
      >
        {t.addItem}
      </button>
    </div>
    <div className="grid gap-2">
      {items.map((item: ProfileItem) => (
        <div key={item.id} className="flex items-center justify-between bg-zinc-900/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate text-zinc-100">{item.title[lang as Language] || item.title['en']}</div>
            <div className="text-[9px] text-zinc-500 truncate uppercase mt-0.5">{item.subtitle[lang as Language] || item.subtitle['en']}</div>
          </div>
          <div className="flex gap-2 ml-4">
            <button type="button" onClick={() => onEdit(item)} className="px-3 py-1 bg-zinc-800 text-[8px] font-bold rounded uppercase hover:bg-zinc-700 transition-colors">Edit</button>
            <button type="button" onClick={() => onDelete(item.id)} className="px-3 py-1 bg-red-900/20 text-red-500 text-[8px] font-bold rounded uppercase hover:bg-red-900/40 transition-colors">Delete</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="text-[10px] text-zinc-600 italic py-2">No items yet.</div>}
    </div>
  </div>
);

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [editingProfileItem, setEditingProfileItem] = useState<{ item: Partial<ProfileItem>, category: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showProfileItemForm, setShowProfileItemForm] = useState(false);
  const [adminTab, setAdminTab] = useState<'events' | 'profile'>('events');
  const [lang, setLang] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const t = TRANSLATIONS[lang];
  
  const [formLang, setFormLang] = useState<Language>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const itemDescRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const auth = storageService.isAuthenticated();
    setIsAuthenticated(auth);
    if (auth) refreshData();
    const handleLang = (e: any) => setLang(e.detail);
    window.addEventListener('langChange', handleLang);
    return () => window.removeEventListener('langChange', handleLang);
  }, []);

  const refreshData = async () => {
    try {
      const [evs, soc, prof] = await Promise.all([
        storageService.getEvents(),
        storageService.getSocialLinks(),
        storageService.getProfile()
      ]);
      setEvents(evs);
      setSocials(soc);
      setProfile(prof);
    } catch (err) {
      console.error("Firebase connection error. Check your Rules and Project ID.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storageService.login(password)) {
      setIsAuthenticated(true);
      refreshData();
    } else alert('Incorrect password');
  };

  const handleLogout = () => {
    storageService.logout();
    setIsAuthenticated(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      await storageService.deleteEvent(id);
      await refreshData();
      setShowForm(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteProfileItem = async (category: string, id: string) => {
    if (window.confirm(t.confirmDelete)) {
      const key = category as keyof ProfileData;
      const collection = (profile[key] as ProfileItem[]).filter(i => i.id !== id);
      const finalProfile = { ...profile, [key]: collection };
      await storageService.saveProfile(finalProfile);
      setProfile(finalProfile);
      setShowProfileItemForm(false);
      setEditingProfileItem(null);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      const finalData: any = { ...editingEvent };
      // Если не соревнование - удаляем место ПОЛНОСТЬЮ из объекта сохранения
      if (finalData.type !== 'competition') {
        finalData.place = null; // Принудительно зануляем в базе
      }
      await storageService.saveEvent(finalData);
      await refreshData();
      setEditingEvent(null);
      setShowForm(false);
    }
  };

  const handleSaveProfileItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfileItem) return;
    const { item, category } = editingProfileItem;
    const key = category as keyof ProfileData;
    const collection = [...((profile[key]) as ProfileItem[])];
    if (item.id) {
      const idx = collection.findIndex(i => String(i.id) === String(item.id));
      if (idx !== -1) collection[idx] = item as ProfileItem;
    } else {
      collection.push({ ...item, id: Math.random().toString(36).substr(2, 9), images: item.images || [] } as ProfileItem);
    }
    const finalProfile = { ...profile, [key]: collection };
    await storageService.saveProfile(finalProfile);
    setProfile(finalProfile);
    setShowProfileItemForm(false);
    setEditingProfileItem(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'event' | 'profile' | 'item') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 1024 * 1024) { alert('File is too large (>1MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      if (target === 'event' && editingEvent) setEditingEvent({ ...editingEvent, images: [...(editingEvent.images || []), result] });
      else if (target === 'profile') {
        const updated = { ...profile, photos: [result] };
        await storageService.saveProfile(updated);
        setProfile(updated);
      } else if (target === 'item' && editingProfileItem) {
        setEditingProfileItem({ ...editingProfileItem, item: { ...editingProfileItem.item, images: [...(editingProfileItem.item.images || []), result] } });
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const insertTag = (tag: string, ref: React.RefObject<HTMLTextAreaElement | null>, updateFn: (v: string) => void) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);
    let newContent = tag === 'a' ? `<a href="${prompt('URL:', 'https://')}" target="_blank" class="text-yellow-500 underline">${selected || 'link'}</a>` : `<${tag}>${selected}</${tag}>`;
    updateFn(before + newContent + after);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 md:mt-32 p-6 md:p-10 bg-zinc-900/50 border border-white/5 rounded-3xl shadow-2xl backdrop-blur-sm mx-4 sm:mx-auto">
        <h2 className="text-xl md:text-3xl font-serif font-bold mb-8 text-center uppercase tracking-tight">{t.adminAccess}</h2>
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-6 text-left">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm" placeholder={t.password} required />
          <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 uppercase text-xs tracking-widest transition-all">{t.authenticate}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-20 space-y-10 md:space-y-20">
      <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
        <button onClick={() => setAdminTab('events')} className={`px-6 md:px-8 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${adminTab === 'events' ? 'border-yellow-500 text-white' : 'border-transparent text-zinc-500 hover:text-white'}`}>{t.events}</button>
        <button onClick={() => setAdminTab('profile')} className={`px-6 md:px-8 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${adminTab === 'profile' ? 'border-yellow-500 text-white' : 'border-transparent text-zinc-500 hover:text-white'}`}>{t.profile}</button>
      </div>

      {adminTab === 'events' && (
        <section>
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-2xl md:text-5xl font-serif font-bold tracking-tight text-left">{t.manageEvents}</h1>
            <div className="flex gap-2">
              <button onClick={() => { setEditingEvent({ title: { en: '', ru: '', cs: '' }, date: new Date().toISOString().split('T')[0], description: { en: '', ru: '', cs: '' }, images: [], type: 'standard' }); setShowForm(true); }} className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-full text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors">{t.createEvent}</button>
              <button onClick={handleLogout} className="px-6 py-3 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Logout</button>
            </div>
          </div>
          <div className="grid gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 text-left flex-1">
                  <img src={event.images[0] || 'https://picsum.photos/seed/placeholder/200/200'} className="w-12 h-12 rounded-xl object-cover bg-black flex-shrink-0" />
                  <div className="truncate">
                    <h3 className="font-serif font-bold truncate text-zinc-100">{event.title[lang] || event.title['en']}</h3>
                    <div className="text-[8px] text-zinc-500 uppercase mt-1">{event.date} • {event.type} {event.type === 'competition' && event.place ? `• ${event.place} Place` : ''}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingEvent({ ...event }); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-zinc-800 text-[9px] uppercase font-bold hover:bg-zinc-700 transition-colors">Edit</button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="px-4 py-2 rounded-lg bg-red-900/20 text-red-500 text-[9px] uppercase font-bold hover:bg-red-900/40 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {adminTab === 'profile' && (
        <section className="space-y-16 text-left">
           <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-5xl font-serif font-bold tracking-tight">Profile Settings</h1>
            <button onClick={handleLogout} className="px-6 py-3 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Logout</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-4 tracking-widest">{t.aboutMe}</label>
                <div className="w-32 h-32 rounded-3xl bg-zinc-900 overflow-hidden relative group border border-white/10 mb-6">
                  <img src={profile.photos[0]} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => profilePhotoRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold uppercase">Change</button>
                </div>
                <input type="file" ref={profilePhotoRef} className="hidden" onChange={(e) => handleFileUpload(e, 'profile')} accept="image/*" />
                <div className="space-y-4">
                  {(['en', 'ru', 'cs'] as Language[]).map(l => (
                    <input key={l} type="text" value={profile.about[l] || ''} onChange={e => { const p = { ...profile, about: { ...profile.about, [l]: e.target.value } }; setProfile(p); storageService.saveProfile(p); }} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm text-zinc-100" placeholder={`${t.aboutMe} (${l})`} />
                  ))}
                </div>
              </div>
              <ProfileListManager category="education" items={profile.education} lang={lang} t={t} onEdit={(item: ProfileItem) => { setEditingProfileItem({ category: 'education', item }); setShowProfileItemForm(true); }} onCreate={() => { setEditingProfileItem({ category: 'education', item: { title: { en: '', ru: '', cs: '' }, subtitle: { en: '', ru: '', cs: '' }, date: '', description: { en: '', ru: '', cs: '' }, images: [] } }); setFormLang('en'); setShowProfileItemForm(true); }} onDelete={(id: string) => handleDeleteProfileItem('education', id)} />
              <ProfileListManager category="skills" items={profile.skills} lang={lang} t={t} onEdit={(item: ProfileItem) => { setEditingProfileItem({ category: 'skills', item }); setShowProfileItemForm(true); }} onCreate={() => { setEditingProfileItem({ category: 'skills', item: { title: { en: '', ru: '', cs: '' }, subtitle: { en: '', ru: '', cs: '' }, date: '', description: { en: '', ru: '', cs: '' }, images: [] } }); setFormLang('en'); setShowProfileItemForm(true); }} onDelete={(id: string) => handleDeleteProfileItem('skills', id)} />
              <ProfileListManager category="practice" items={profile.practice} lang={lang} t={t} onEdit={(item: ProfileItem) => { setEditingProfileItem({ category: 'practice', item }); setShowProfileItemForm(true); }} onCreate={() => { setEditingProfileItem({ category: 'practice', item: { title: { en: '', ru: '', cs: '' }, subtitle: { en: '', ru: '', cs: '' }, date: '', description: { en: '', ru: '', cs: '' }, images: [] } }); setFormLang('en'); setShowProfileItemForm(true); }} onDelete={(id: string) => handleDeleteProfileItem('practice', id)} />
            </div>
            <div className="bg-zinc-900/20 p-8 rounded-3xl border border-white/5 h-fit lg:sticky lg:top-32">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-yellow-500">Social Connections</h3>
              <div className="space-y-4">
                {socials.map(link => (
                  <div key={link.id} className="flex gap-2">
                    <input type="text" value={link.platform} onChange={e => { const updated = socials.map(s => s.id === link.id ? { ...s, platform: e.target.value } : s); setSocials(updated); storageService.saveSocialLinks(updated); window.dispatchEvent(new CustomEvent('socialUpdate')); }} className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-100" />
                    <input type="text" value={link.url} onChange={e => { const updated = socials.map(s => s.id === link.id ? { ...s, url: e.target.value } : s); setSocials(updated); storageService.saveSocialLinks(updated); window.dispatchEvent(new CustomEvent('socialUpdate')); }} className="flex-[2] bg-black border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-100" />
                    <button type="button" onClick={() => { const updated = socials.filter(s => s.id !== link.id); setSocials(updated); storageService.saveSocialLinks(updated); window.dispatchEvent(new CustomEvent('socialUpdate')); }} className="text-red-500 text-[14px] hover:text-red-400">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => { const updated = [...socials, { id: Math.random().toString(36).substr(2, 9), platform: 'New', url: '' }]; setSocials(updated); storageService.saveSocialLinks(updated); window.dispatchEvent(new CustomEvent('socialUpdate')); }} className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] font-bold text-zinc-500 hover:text-white transition-all">Add Link</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EVENT MODAL */}
      {showForm && editingEvent && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto relative no-scrollbar shadow-2xl">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">✕</button>
            <div className="flex gap-2 mb-8 border-b border-white/5 pb-4">
              {(['en', 'ru', 'cs'] as Language[]).map(l => (
                <button key={l} type="button" onClick={() => setFormLang(l)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${formLang === l ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <form onSubmit={handleSaveEvent} className="space-y-6 text-left">
              <input type="text" value={editingEvent.title?.[formLang] || ''} onChange={e => setEditingEvent({ ...editingEvent, title: { ...editingEvent.title!, [formLang]: e.target.value } })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm text-zinc-100" placeholder={t.title} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm text-zinc-100" required />
                <select value={editingEvent.type} onChange={e => setEditingEvent({ ...editingEvent, type: e.target.value as EventType })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm text-zinc-100">
                  <option value="standard">{t.standard}</option>
                  <option value="competition">{t.competition}</option>
                  <option value="journey">{t.journey}</option>
                </select>
              </div>
              {editingEvent.type === 'competition' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">{t.place}</label>
                  <div className="flex gap-4">
                    {[1, 2, 3].map(p => (
                      <button key={p} type="button" onClick={() => setEditingEvent({ ...editingEvent, place: p as AwardPlace })} className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${editingEvent.place === p ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-black border-white/10 text-zinc-500'}`}>{p} Place</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase text-zinc-500">{t.description}</span><div className="flex gap-1"><button type="button" onClick={() => insertTag('b', descRef, v => setEditingEvent({ ...editingEvent, description: { ...editingEvent.description!, [formLang]: v } }))} className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold">B</button><button type="button" onClick={() => insertTag('a', descRef, v => setEditingEvent({ ...editingEvent, description: { ...editingEvent.description!, [formLang]: v } }))} className="px-2 py-1 bg-zinc-800 rounded text-[10px]">URL</button></div></div>
                <textarea ref={descRef} value={editingEvent.description?.[formLang] || ''} onChange={e => setEditingEvent({ ...editingEvent, description: { ...editingEvent.description!, [formLang]: e.target.value } })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 h-32 text-sm text-zinc-100" required />
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {editingEvent.images?.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group"><img src={img} className="w-full h-full object-cover" /><button type="button" onClick={() => setEditingEvent({ ...editingEvent, images: editingEvent.images?.filter((_, i) => i !== idx) })} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button></div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-500 hover:text-white">+</button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'event')} accept="image/*" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-[2] py-4 bg-yellow-500 text-black font-bold uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-colors">{t.save}</button>
                {editingEvent.id && (
                  <button type="button" onClick={() => handleDeleteEvent(editingEvent.id!)} className="flex-1 py-4 bg-red-900/20 text-red-500 font-bold uppercase tracking-widest rounded-2xl hover:bg-red-900/40 transition-colors">Delete</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE ITEM MODAL */}
      {showProfileItemForm && editingProfileItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto relative no-scrollbar shadow-2xl">
            <button onClick={() => setShowProfileItemForm(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">✕</button>
            <div className="flex gap-2 mb-8 border-b border-white/5 pb-4">
              {(['en', 'ru', 'cs'] as Language[]).map(l => (
                <button key={l} type="button" onClick={() => setFormLang(l)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${formLang === l ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <form onSubmit={handleSaveProfileItem} className="space-y-6 text-left">
              <input type="text" value={editingProfileItem.item.title?.[formLang] || ''} onChange={e => setEditingProfileItem({ ...editingProfileItem, item: { ...editingProfileItem.item, title: { ...editingProfileItem.item.title!, [formLang]: e.target.value } } })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm text-zinc-100" placeholder={t.title} required />
              <input type="text" value={editingProfileItem.item.subtitle?.[formLang] || ''} onChange={e => setEditingProfileItem({ ...editingProfileItem, item: { ...editingProfileItem.item, subtitle: { ...editingProfileItem.item.subtitle!, [formLang]: e.target.value } } })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm text-zinc-100" placeholder={t.subtitle} required />
              <input type="text" value={editingProfileItem.item.date || ''} onChange={e => setEditingProfileItem({ ...editingProfileItem, item: { ...editingProfileItem.item, date: e.target.value } })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 text-sm text-zinc-100" placeholder={t.date} required />
              <div className="space-y-2">
                 <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase text-zinc-500">{t.description}</span><div className="flex gap-1"><button type="button" onClick={() => insertTag('b', itemDescRef, v => setEditingProfileItem({ ...editingProfileItem, item: { ...editingProfileItem.item, description: { ...editingProfileItem.item.description!, [formLang]: v } } }))} className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold">B</button></div></div>
                 <textarea ref={itemDescRef} value={editingProfileItem.item.description?.[formLang] || ''} onChange={e => setEditingProfileItem({ ...editingProfileItem, item: { ...editingProfileItem.item, description: { ...editingProfileItem.item.description!, [formLang]: e.target.value } } })} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 h-32 text-sm text-zinc-100" placeholder={t.description} required />
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {editingProfileItem.item.images?.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group"><img src={img} className="w-full h-full object-cover" /><button type="button" onClick={() => setEditingProfileItem({ ...editingProfileItem, item: { ...editingProfileItem.item, images: editingProfileItem.item.images?.filter((_, i) => i !== idx) } })} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button></div>
                ))}
                <button type="button" onClick={() => itemFileInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-500 hover:text-white">+</button>
                <input type="file" ref={itemFileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'item')} accept="image/*" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-[2] py-4 bg-yellow-500 text-black font-bold uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-colors">{t.save}</button>
                {editingProfileItem.item.id && (
                  <button type="button" onClick={() => handleDeleteProfileItem(editingProfileItem.category, editingProfileItem.item.id!)} className="flex-1 py-4 bg-red-900/20 text-red-500 font-bold uppercase tracking-widest rounded-2xl hover:bg-red-900/40 transition-colors">Delete</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
