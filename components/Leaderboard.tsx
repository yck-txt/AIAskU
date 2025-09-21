import React from 'react';
import type { User } from '../types';
import { useTranslation } from '../locales/i18n';

interface LeaderboardProps {
    allUsers: User[];
    currentUser: User;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ allUsers, currentUser }) => {
    const { t } = useTranslation();

    const sortedUsers = [...allUsers].sort((a, b) => b.xp - a.xp);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-slide-up-fade">
            <header className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-10 h-10 text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11.918 2.131a.5.5 0 01.764 0l1.25 1.405a.5.5 0 00.434.204h1.616a.5.5 0 01.47.718l-1.98 3.633a.5.5 0 00.22.63l2.428 1.403a.5.5 0 01.144.693l-1.98 3.633a.5.5 0 01-.764 0l-1.25-1.405a.5.5 0 00-.434-.204H8.384a.5.5 0 00-.434.204l-1.25 1.405a.5.5 0 01-.764 0l-1.98-3.633a.5.5 0 01.144-.693l2.428-1.403a.5.5 0 00.22-.63L2.53 4.456a.5.5 0 01.47-.718h1.616a.5.5 0 00.434-.204l1.25-1.405a.5.5 0 01.764 0L8 3.536l1.25-1.405a.5.5 0 00-.434-.204h0L11.918 2.131zM3 11.25a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 11.25zM4 15a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-700">{t('leaderboardTitle')}</h2>
            </header>
            
            {sortedUsers.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate-500">{t('leaderboardNoUsers')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="border-b bg-slate-50">
                                <th className="p-4 text-sm font-semibold text-slate-600 w-16 text-center">{t('leaderboardRank')}</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">{t('leaderboardUser')}</th>
                                <th className="p-4 text-sm font-semibold text-slate-600 text-center">{t('leaderboardLevel')}</th>
                                <th className="p-4 text-sm font-semibold text-slate-600 text-right">{t('leaderboardXP')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((user, index) => {
                                const isCurrentUser = user.username === currentUser.username;
                                return (
                                    <tr
                                        key={user.username}
                                        className={`border-b transition-colors ${isCurrentUser ? 'bg-blue-100 font-bold' : 'hover:bg-slate-100'}`}
                                        title={isCurrentUser ? t('leaderboardYourRank') : ''}
                                    >
                                        <td className="p-4 text-center">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-yellow-400 text-white' : 'bg-slate-200'} text-sm`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0" dangerouslySetInnerHTML={{ __html: user.avatar }} />
                                                <span>{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 text-center">{user.level}</td>
                                        <td className="p-4 text-slate-800 text-right">{user.xp.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
