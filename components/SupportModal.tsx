import React, { useState, useEffect, useRef } from 'react';
import type { SupportTicket, SupportMessage } from '../types';
import { useTranslation } from '../locales/i18n';
import { LoadingSpinner } from './LoadingSpinner';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: SupportTicket | null;
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, ticket, onSendMessage, isLoading }) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isOpen, ticket?.messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLocked) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };
    
    const isLocked = ticket?.lastMessageFrom === 'user';

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col animate-slide-up-fade"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-slate-800">{t('supportTitle')}</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                        aria-label={t('reviewModalClose')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
                    {ticket?.messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </main>
                <footer className="p-4 border-t bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={isLocked ? t('supportWaitingForReply') : t('supportTypeMessage')}
                                className="w-full p-2 border border-slate-500 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-600 placeholder:text-slate-400"
                                disabled={isLocked || isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLocked || isLoading || !message.trim()}
                                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center w-24 h-10"
                            >
                                {isLoading ? <LoadingSpinner /> : t('supportSend')}
                            </button>
                        </div>
                    </form>
                </footer>
            </div>
        </div>
    );
};