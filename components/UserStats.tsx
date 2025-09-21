
import React, { useState, useEffect } from 'react';
import { getQuizStats, updateUserAvatar, promoteUserToAdmin } from '../services/userService';
import { generateAvatar } from '../services/geminiService';
import { calculateLevelInfo } from '../services/levelService';
import type { QuizStat, User } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { QuizReviewModal } from './QuizReviewModal';
import { useTranslation } from '../locales/i18n';

interface UserStatsProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export const UserStats: React.FC<UserStatsProps> = ({ user, onUserUpdate }) => {
  const { t, language } = useTranslation();
  const [stats, setStats] = useState<QuizStat[]>([]);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedStat, setSelectedStat] = useState<QuizStat | null>(null);
  const [adminCode, setAdminCode] = useState('');
  const [adminMessage, setAdminMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const levelInfo = calculateLevelInfo(user.xp);

  useEffect(() => {
    setStats(getQuizStats(user.username));
  }, [user.username]);

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);
    setError(null);
    setNewAvatarPreview(null);
    try {
        const avatarSvg = await generateAvatar();
        setNewAvatarPreview(avatarSvg);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(t('errorUnknownAvatar'));
        }
    } finally {
        setIsGeneratingAvatar(false);
    }
  };

  const handleSaveAvatar = () => {
    if (!newAvatarPreview) return;
    const updatedUser = updateUserAvatar(user.username, newAvatarPreview);
    if (updatedUser) {
        onUserUpdate(updatedUser);
        setNewAvatarPreview(null); // Clear preview
    } else {
        setError(t('errorFailedToSaveAvatar'));
    }
  };

  const handleCancel = () => {
    setNewAvatarPreview(null);
    setError(null);
  };

  const handleRowClick = (stat: QuizStat) => {
    if (stat.questions && stat.userAnswers) {
      setSelectedStat(stat);
    }
  };

  const closeModal = () => {
    setSelectedStat(null);
  };

  const handleAdminUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpgrading(true);
    setAdminMessage(null);

    const result = promoteUserToAdmin(user.username, adminCode);

    if (result.success && result.user) {
        setAdminMessage({ type: 'success', text: t(result.message) });
        onUserUpdate(result.user);
    } else {
        setAdminMessage({ type: 'error', text: t(result.message) });
    }
    setAdminCode('');
    setIsUpgrading(false);
  }
  
  return (
    <>
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-slide-up-fade space-y-8">
        {/* Profile Section */}
        <div className="p-6 bg-slate-50 rounded-lg border">
            <h3 className="text-xl font-bold text-slate-700 mb-4">{t('statsMyProfile')}</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div 
                    className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-4 border-blue-200 flex-shrink-0"
                    dangerouslySetInnerHTML={{ __html: newAvatarPreview || user.avatar }}
                />
                <div className="flex-1 w-full">
                    <div className="flex items-baseline gap-3">
                        <h4 className="text-2xl font-bold text-slate-800">{user.username}</h4>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{t('statsLevel')} {levelInfo.level}</span>
                    </div>
                    {/* XP Bar */}
                    <div className="mt-2">
                        <div className="flex justify-between text-sm font-medium text-slate-500 mb-1">
                            <span>{t('statsXP')}</span>
                            <span>{levelInfo.xpInLevel} / {levelInfo.xpForNextLevel}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
                        </div>
                        <div className="text-right text-xs text-slate-500 mt-1">
                            {levelInfo.xpForNextLevel - levelInfo.xpInLevel} {t('statsNextLevel')}
                        </div>
                    </div>
                </div>
            </div>
             <div className="mt-6">
                {newAvatarPreview ? (
                    <div className="space-y-3">
                        <p className="text-slate-600 font-medium">{t('statsNewLook')}</p>
                        <div className="flex gap-3">
                            <button onClick={handleSaveAvatar} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-colors">
                                {t('statsSaveAvatar')}
                            </button>
                            <button onClick={handleCancel} className="bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                                {t('statsCancel')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        id="tour-generate-avatar"
                        onClick={handleGenerateAvatar}
                        disabled={isGeneratingAvatar}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors disabled:bg-slate-400 flex items-center justify-center h-10 min-w-[180px]"
                    >
                    {isGeneratingAvatar ? <LoadingSpinner /> : t('statsGenerateAvatar')}
                    </button>
                )}
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
        </div>

        {/* Admin Section */}
        <div className="p-6 bg-slate-50 rounded-lg border">
            <h3 className="text-xl font-bold text-slate-700 mb-4">{t('statsAdminAccess')}</h3>
            {user.isAdmin ? (
                <p className="text-green-600 font-semibold">{t('statsAdminStatus')}</p>
            ) : (
                <form onSubmit={handleAdminUpgrade} className="space-y-3">
                    <p className="text-slate-600 text-sm">{t('statsAdminEnterCode')}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="password" 
                            value={adminCode} 
                            onChange={e => setAdminCode(e.target.value)}
                            className="flex-grow p-2 border border-slate-500 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-600 placeholder:text-slate-400"
                            placeholder={t('statsAdminCodeword')}
                            required
                        />
                        <button type="submit" disabled={isUpgrading || !adminCode} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 flex items-center justify-center disabled:bg-slate-400 h-10">
                            {isUpgrading ? <LoadingSpinner /> : t('statsAdminUpgrade')}
                        </button>
                    </div>
                     {adminMessage && (
                        <p className={`mt-2 text-sm ${adminMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {adminMessage.text}
                        </p>
                    )}
                </form>
            )}
        </div>
      
        {/* Badges Section */}
        <div>
            <h3 className="text-xl font-bold text-slate-700 mb-4">{t('statsBadgesEarned')}</h3>
            {user.badges && user.badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {user.badges.sort((a,b) => a.level - b.level).map(badge => (
                        <div key={badge.level} className="text-center p-2 bg-slate-50 rounded-lg border group" title={`${badge.name} - ${t('statsLevel')} ${badge.level}`}>
                            <div className="w-16 h-16 mx-auto mb-2 transition-transform group-hover:scale-110" dangerouslySetInnerHTML={{ __html: badge.svg }} />
                            <p className="text-xs font-semibold text-slate-600 truncate">{badge.name}</p>
                            <p className="text-xs text-slate-500">{t('statsLevel')} {badge.level}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-sm">{t('statsNoBadges')}</p>
            )}
        </div>

        {/* Stats Table Section */}
        <div>
            <h2 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-4">{t('statsMyQuizStats')}</h2>
            
            {stats.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate-500">{t('statsNoQuizzes')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="border-b bg-slate-50">
                        <th className="p-4 text-sm font-semibold text-slate-600">{t('statsTopic')}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600">{t('statsScore')}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600">{t('statsPercentage')}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600">{t('statsDate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((stat, index) => {
                            const percentage = Math.round((stat.score / stat.totalQuestions) * 100);
                            const isReviewable = stat.questions && stat.questions.length > 0;
                            return (
                                <tr
                                    key={index}
                                    className={`border-b hover:bg-slate-100 transition-colors ${isReviewable ? 'cursor-pointer' : ''}`}
                                    onClick={() => isReviewable && handleRowClick(stat)}
                                    title={isReviewable ? t('statsReviewAvailable') : t('statsReviewNotAvailable')}
                                >
                                    <td className="p-4 font-medium text-slate-800">{stat.topic}</td>
                                    <td className="p-4 text-slate-600">{stat.score} / {stat.totalQuestions}</td>
                                    <td className="p-4 text-slate-600">
                                        <span className={`font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {percentage}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600">{new Date(stat.date).toLocaleDateString(language)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
    <QuizReviewModal
        isOpen={!!selectedStat}
        onClose={closeModal}
        quizStat={selectedStat}
    />
    </>
  );
};