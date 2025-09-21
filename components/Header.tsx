import React from 'react';
import type { User } from '../types';
import { useTranslation } from '../locales/i18n';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    onStartTour: () => void;
    onSupport: () => void;
    hasUnreadSupportMessage: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onStartTour, onSupport, hasUnreadSupportMessage }) => {
  const { t, language, setLanguage } = useTranslation();
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#2563eb', stopOpacity: 1}} />
                        </linearGradient>
                    </defs>
                    <path d="M50 10 C 25 10, 10 30, 10 50 C 10 70, 25 90, 50 90 C 75 90, 90 70, 90 50 A 40 40 0 0 0 50 10 Z" fill="url(#grad1)"/>
                    <path d="M42 30 C 42 25, 45 22, 50 22 C 55 22, 58 25, 58 30 C 58 35, 54 37, 51 40 L 49 42 C 45 46, 45 50, 45 50 L 55 50" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="50" cy="62" r="4" fill="white"/>
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
            AIAskU - Custom Quiz Me AI
            </h1>
        </div>

        {user && (
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <span className="text-slate-600">{t('headerWelcome')},</span>
                    <span className="font-bold block">{user.username}</span>
                </div>
                <div 
                    className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-blue-300"
                    dangerouslySetInnerHTML={{ __html: user.avatar }}
                />
                 <button 
                    onClick={onStartTour} 
                    className="p-2 rounded-full hover:bg-slate-200 transition-colors" 
                    aria-label="Start interactive tour"
                    title={t('headerTourTitle')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                <button 
                    onClick={onSupport} 
                    className="relative p-2 rounded-full hover:bg-slate-200 transition-colors" 
                    aria-label="Support"
                    title={t('supportTitle')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {hasUnreadSupportMessage && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                </button>
                <div className="relative">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-slate-700 text-white font-medium py-2 pl-3 pr-8 rounded-lg hover:bg-slate-600 transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label={t('headerLanguageSelectorLabel')}
                    >
                        <option value="en">EN</option>
                        <option value="de">DE</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-300">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                <button 
                    onClick={onLogout}
                    className="bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
                >
                    {t('headerLogout')}
                </button>
            </div>
        )}
      </div>
    </header>
  );
};