
import React, { useState } from 'react';
import { registerUser, loginUser, isUsernameTaken } from '../services/userService';
import { generateUserCredentials } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { CredentialsDisplay } from './CredentialsDisplay';
import type { User } from '../types';
import { useTranslation } from '../locales/i18n';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const { t, language, setLanguage } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyRegisteredUser, setNewlyRegisteredUser] = useState<Omit<User, 'level' | 'xp' | 'badges' | 'isAdmin'> | null>(null);
  const [skipTour, setSkipTour] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError(t('errorUsernamePasswordRequired'));
      return;
    }

    const result = loginUser(username, password);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(t(result.message));
    }
  };

  const handleGenerateAccount = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
        let newUser: Omit<User, 'level' | 'xp' | 'badges' | 'isAdmin'> | null = null;
        // Try a few times to get a unique username
        for (let i = 0; i < 3; i++) {
            const credentials = await generateUserCredentials(language);
            if (!isUsernameTaken(credentials.username)) {
                newUser = credentials;
                break;
            }
        }

        if (!newUser) {
            throw new Error(t('errorCouldNotGenerateUsername'));
        }

        const result = registerUser(newUser, adminCode);
        if (result.success) {
            setNewlyRegisteredUser(newUser);
            if (skipTour) {
                localStorage.setItem('hasCompletedTour', 'true');
            }
        } else {
            setError(t(result.message));
        }

    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(t('errorUnknown'));
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const handleContinueToLogin = () => {
    setNewlyRegisteredUser(null);
    setIsLogin(true);
    setUsername('');
    setPassword('');
    setError('');
  };

  const renderAuthForm = () => {
    if (isLogin) {
      return (
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-slate-600 font-medium mb-2" htmlFor="username">
              {t('authUsername')}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-500 bg-slate-700 text-white placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-600 font-medium mb-2" htmlFor="password">
              {t('authPassword')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-500 bg-slate-700 text-white placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
          >
            {t('authLogin')}
          </button>
        </form>
      );
    }

    // Registration View
    return (
        <div className="text-center">
            <p className="text-slate-600 mb-4">
                {t('authGenerateAccountPrompt')}
            </p>
            <div className="space-y-4 mb-6 text-left">
                <div>
                    <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="adminCode">
                        {t('authAdminCode')}
                    </label>
                    <input
                        type="password"
                        id="adminCode"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        className="w-full p-2 border border-slate-500 bg-slate-700 text-white placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <label className="flex items-center text-slate-600">
                    <input
                        type="checkbox"
                        checked={skipTour}
                        onChange={(e) => setSkipTour(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{t('authSkipTour')}</span>
                </label>
            </div>
            <button
                onClick={handleGenerateAccount}
                disabled={isGenerating}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center h-12"
            >
                {isGenerating ? <LoadingSpinner /> : t('authGenerateMyAccount')}
            </button>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="inline-flex items-center gap-3 mb-6">
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
                    Custom Quiz Me AI
                </h1>
            </div>

            {newlyRegisteredUser ? (
                <CredentialsDisplay credentials={newlyRegisteredUser} onContinue={handleContinueToLogin} />
            ) : (
                 <div className="bg-white p-8 rounded-xl shadow-lg w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-700">{isLogin ? t('authLogin') : t('authCreateAccount')}</h2>
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
                    </div>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">{error}</p>}
                    {renderAuthForm()}
                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-blue-600 hover:underline font-medium">
                        {isLogin ? t('authNeedAccount') : t('authHaveAccount')}
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-6">
                        {t('authLocalStorageNote')}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};