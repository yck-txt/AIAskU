import React from 'react';
import type { User } from '../types';
import { useTranslation } from '../locales/i18n';

interface CredentialsDisplayProps {
  // FIX: Updated Omit to include 'isAdmin' as it's not provided or used by this component.
  credentials: Omit<User, 'level' | 'xp' | 'badges' | 'isAdmin'>;
  onContinue: () => void;
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

export const CredentialsDisplay: React.FC<CredentialsDisplayProps> = ({ credentials, onContinue }) => {
  const { t } = useTranslation();

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text);
    const element = document.getElementById(`${field}-copy-feedback`);
    if(element) {
        element.textContent = t('credentialsCopied');
        setTimeout(() => {
            element.textContent = t('credentialsCopy');
        }, 2000);
    }
  };

  const handleDownload = () => {
    const content = `${t('credentialsFileHeader')}\n\n${t('credentialsFileBody')}\n\n${t('authUsername')}: ${credentials.username}\n${t('authPassword')}: ${credentials.password}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wikiquiz-ai-credentials-${credentials.username}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-slide-up-fade">
      <h2 className="text-2xl font-bold text-center text-slate-700 mb-4">{t('credentialsTitle')}</h2>
      <p className="text-center text-slate-500 mb-6">
        {t('credentialsWelcome')} <strong>{t('credentialsNotShownAgain')}</strong>
      </p>

      <div className="flex justify-center mb-6">
        <div 
          className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-blue-200"
          dangerouslySetInnerHTML={{ __html: credentials.avatar }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-600 font-medium mb-1">{t('authUsername')}</label>
          <div className="flex items-center">
            <input
              type="text"
              readOnly
              value={credentials.username}
              className="w-full p-3 border border-slate-500 rounded-l-lg bg-slate-700 text-white font-mono"
            />
            <button id="username-copy-feedback" onClick={() => handleCopy(credentials.username, 'username')} className="bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-r-lg hover:bg-slate-300 transition-colors w-24">{t('credentialsCopy')}</button>
          </div>
        </div>
        <div>
          <label className="block text-slate-600 font-medium mb-1">{t('authPassword')}</label>
           <div className="flex items-center">
            <input
              type="text"
              readOnly
              value={credentials.password}
              className="w-full p-3 border border-slate-500 rounded-l-lg bg-slate-700 text-white font-mono"
            />
            <button id="password-copy-feedback" onClick={() => handleCopy(credentials.password, 'password')} className="bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-r-lg hover:bg-slate-300 transition-colors w-24">{t('credentialsCopy')}</button>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={onContinue}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
        >
          {t('credentialsContinue')}
        </button>
        <button
          onClick={handleDownload}
          className="w-full bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-colors flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          {t('credentialsDownload')}
        </button>
      </div>
    </div>
  );
};
