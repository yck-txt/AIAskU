import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { useTranslation } from '../locales/i18n';
import { getXPForLevel } from '../services/levelService';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedUser: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const { t } = useTranslation();
    const [editedUser, setEditedUser] = useState<User>(user);
    const [newPassword, setNewPassword] = useState('');
    const [newLevel, setNewLevel] = useState(user.level);

    useEffect(() => {
        setEditedUser(user);
        setNewLevel(user.level);
        setNewPassword('');
    }, [user]);

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        let updatedUser = { ...editedUser };

        if (newPassword) {
            updatedUser.password = newPassword;
        }

        if (newLevel !== user.level) {
            updatedUser.level = newLevel;
            updatedUser.xp = getXPForLevel(newLevel);
            // Admins can set levels, but badges are earned.
            // We'll filter badges to only keep those earned up to the new level.
            updatedUser.badges = updatedUser.badges.filter(b => b.level < newLevel);
        }
        
        onSave(updatedUser);
    };

    const handleResetLevel = () => {
        if (window.confirm(t('adminConfirmResetUserLevel'))) {
            setEditedUser({
                ...editedUser,
                level: 1,
                xp: 0,
                badges: [],
            });
            setNewLevel(1);
        }
    };


    if (!isOpen) return null;
    
    const inputClasses = "w-full p-2 border border-slate-500 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-600 placeholder:text-slate-400";
    const labelClasses = "block text-sm font-medium text-slate-700 mb-1";

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up-fade"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 sm:p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-800">{t('adminEditUser')}: <span className="text-blue-600">{user.username}</span></h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200" aria-label={t('reviewModalClose')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <form onSubmit={handleSaveChanges}>
                    <main className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="password" className={labelClasses}>{t('adminResetPassword')}</label>
                            <input
                                id="password"
                                type="text"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className={inputClasses}
                                placeholder={t('adminNewPasswordPlaceholder')}
                            />
                        </div>
                         <div>
                            <label htmlFor="level" className={labelClasses}>{t('adminSetLevel')}</label>
                            <input
                                id="level"
                                type="number"
                                value={newLevel}
                                onChange={e => setNewLevel(parseInt(e.target.value, 10))}
                                className={inputClasses}
                                min="1"
                            />
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleResetLevel}
                                className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600"
                            >
                                {t('adminResetLevelAndBadges')}
                            </button>
                        </div>
                    </main>
                    <footer className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300">
                            {t('modalCancel')}
                        </button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                           {t('modalSaveChanges')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};