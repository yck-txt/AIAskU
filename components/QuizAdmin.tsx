import React, { useState, useRef, useEffect } from 'react';
import type { SavedQuiz, QuizQuestion, Difficulty, User, SupportTicket } from '../types';
import { useTranslation } from '../locales/i18n';
import { LoadingSpinner } from './LoadingSpinner';
import { EditQuestionModal } from './EditQuestionModal';
import { EditUserModal } from './EditUserModal';
import { generateSingleQuizQuestion } from '../services/geminiService';

interface QuizAdminProps {
    allQuizzes: SavedQuiz[];
    onUpdateQuiz: (updatedQuiz: SavedQuiz) => void;
    onDeleteQuiz: (quizId: string) => void;
    onRegenerateQuiz: (quiz: SavedQuiz, count: number, difficulty: Difficulty) => Promise<SavedQuiz>;
    allUsers: User[];
    onUpdateUser: (user: User) => { success: boolean, message: string };
    onDeleteUser: (username: string) => { success: boolean, message: string };
    allSupportTickets: SupportTicket[];
    onAdminReply: (username: string, message: string) => void;
    onAdminViewTicket: (username: string) => void;
}

type AdminTab = 'quizzes' | 'users' | 'support';

export const QuizAdmin: React.FC<QuizAdminProps> = ({
    allQuizzes,
    onUpdateQuiz,
    onDeleteQuiz,
    onRegenerateQuiz,
    allUsers,
    onUpdateUser,
    onDeleteUser,
    allSupportTickets,
    onAdminReply,
    onAdminViewTicket,
}) => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<AdminTab>('quizzes');
    
    // Quiz state
    const [selectedQuiz, setSelectedQuiz] = useState<SavedQuiz | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
    const [regenerateCount, setRegenerateCount] = useState(5);
    const [regenerateDifficulty, setRegenerateDifficulty] = useState<Difficulty>('Medium');

    // User state
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    // Support state
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [adminReply, setAdminReply] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === 'support' && selectedTicket) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedTicket, activeTab, allSupportTickets]);

    const handleSelectQuiz = (quiz: SavedQuiz) => {
        setSelectedQuiz(quiz);
        setRegenerateCount(quiz.questions.length);
    };

    const handleAddNewQuestion = async () => {
        if (!selectedQuiz) return;
        setIsLoading(true);
        setError(null);
        try {
            const newQuestionData = await generateSingleQuizQuestion(selectedQuiz.topic, selectedQuiz.questions, language, regenerateDifficulty);
            const newQuestion: QuizQuestion = {
                ...newQuestionData,
                id: (selectedQuiz.questions.length > 0 ? Math.max(...selectedQuiz.questions.map(q => q.id)) : 0) + 1
            };
            const updatedQuiz = {
                ...selectedQuiz,
                questions: [...selectedQuiz.questions, newQuestion]
            };
            onUpdateQuiz(updatedQuiz);
            setSelectedQuiz(updatedQuiz);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditQuestion = (question: QuizQuestion) => setEditingQuestion(question);

    const handleSaveEditedQuestion = (updatedQuestion: QuizQuestion) => {
        if (!selectedQuiz) return;
        const updatedQuestions = selectedQuiz.questions.map(q =>
            q.id === updatedQuestion.id ? updatedQuestion : q
        );
        const updatedQuiz = { ...selectedQuiz, questions: updatedQuestions };
        onUpdateQuiz(updatedQuiz);
        setSelectedQuiz(updatedQuiz);
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = (questionId: number) => {
        if (!selectedQuiz || !window.confirm(t('adminConfirmDeleteQuestion'))) return;
        const updatedQuestions = selectedQuiz.questions.filter(q => q.id !== questionId);
        const updatedQuiz = { ...selectedQuiz, questions: updatedQuestions };
        onUpdateQuiz(updatedQuiz);
        setSelectedQuiz(updatedQuiz);
    };

    const handleRegenerate = async () => {
        if (!selectedQuiz || !window.confirm(t('adminRegenerateQuiz'))) return;
        setIsLoading(true);
        setError(null);
        try {
            const updatedQuiz = await onRegenerateQuiz(selectedQuiz, regenerateCount, regenerateDifficulty);
            setSelectedQuiz(updatedQuiz);
        } catch (err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteQuiz = () => {
        if (!selectedQuiz || !window.confirm(t('adminConfirmDeleteQuiz'))) return;
        onDeleteQuiz(selectedQuiz.id);
        setSelectedQuiz(null);
    };

    const handleEditUser = (user: User) => setEditingUser(user);

    const handleDeleteUser = (username: string) => {
        if (window.confirm(t('adminConfirmDeleteUser'))) {
            onDeleteUser(username);
        }
    };

    const handleSaveUser = (user: User) => {
        onUpdateUser(user);
        setEditingUser(null);
    };
    
    const handleSelectTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        onAdminViewTicket(ticket.username);
    };
    
    const handleAdminReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminReply.trim() && selectedTicket) {
            onAdminReply(selectedTicket.username, adminReply.trim());
            setAdminReply('');
            // The ticket will be updated via props from App.tsx, so we need to find the latest version
             const updatedTicket = allSupportTickets.find(t => t.username === selectedTicket.username);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            }
        }
    };

    const inputClasses = "w-full p-2 border border-slate-500 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-600 placeholder:text-slate-400";
    
    const renderQuizManagement = () => (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/3">
                <ul className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                    {allQuizzes.length > 0 ? allQuizzes.map(quiz => (
                        <li key={quiz.id}>
                            <button
                                onClick={() => handleSelectQuiz(quiz)}
                                className={`w-full text-left p-3 rounded-lg transition-colors text-base font-medium ${selectedQuiz?.id === quiz.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{quiz.topic}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${quiz.visibility === 'public' ? 'bg-green-200 text-green-800' : 'bg-slate-300 text-slate-700'}`}>
                                        {quiz.visibility}
                                    </span>
                                </div>
                                <p className="text-xs mt-1 opacity-70">by {quiz.createdBy}</p>
                            </button>
                        </li>
                    )) : (
                        <p className="p-4 text-center text-slate-500">{t('adminNoQuizzes')}</p>
                    )}
                </ul>
            </aside>
            <main className="flex-1">
                {!selectedQuiz ? (
                    <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-8">
                        <p className="text-slate-500">{t('adminSelectQuiz')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-700">{t('adminEditQuizTitle')}: <span className="text-blue-600">{selectedQuiz.topic}</span></h3>
                        <div className="space-y-3">
                            <h4 className="font-semibold text-lg">{t('adminQuestions')} ({selectedQuiz.questions.length})</h4>
                            <ul className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                                {selectedQuiz.questions.map((q, index) => (
                                    <li key={q.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                        <span className="text-slate-700">{index + 1}. {q.question}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditQuestion(q)} className="p-1.5 rounded-md hover:bg-blue-100" title={t('modalEditQuestionTitle')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 rounded-md hover:bg-red-100" title={t('adminDeleteQuiz')}>
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleAddNewQuestion} disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:bg-slate-400">
                                {isLoading ? <LoadingSpinner /> : t('adminAddNewQuestion')}
                            </button>
                        </div>
                        <div className="border-t pt-6 space-y-4">
                             <h4 className="font-semibold text-lg">{t('adminRegenerateOptions')}</h4>
                             <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50">
                                 <div>
                                    <label className="text-sm font-medium text-slate-600 block mb-1" htmlFor="regen-q-count">{t('sidebarNumberOfQuestions')}</label>
                                    <input type="number" id="regen-q-count" value={regenerateCount} onChange={e => setRegenerateCount(parseInt(e.target.value, 10))} min="3" max="50" className={inputClasses}/>
                                 </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-600 block mb-1" htmlFor="regen-difficulty">{t('sidebarDifficulty')}</label>
                                    <select id="regen-difficulty" value={regenerateDifficulty} onChange={e => setRegenerateDifficulty(e.target.value as Difficulty)} className={inputClasses}>
                                        <option value="Easy">{t('sidebarDifficultyEasy')}</option>
                                        <option value="Medium">{t('sidebarDifficultyMedium')}</option>
                                        <option value="Hard">{t('sidebarDifficultyHard')}</option>
                                    </select>
                                  </div>
                                  <div className="col-span-2">
                                    <button onClick={handleRegenerate} disabled={isLoading} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 flex items-center justify-center disabled:bg-slate-400">
                                        {isLoading ? <LoadingSpinner /> : t('adminRegenerateQuiz')}
                                    </button>
                                  </div>
                             </div>
                              <button onClick={handleDeleteQuiz} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                                  {t('adminDeleteQuiz')}
                              </button>
                        </div>
                         {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                    </div>
                )}
            </main>
        </div>
    );
    
    const renderUserManagement = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
                <thead>
                    <tr className="border-b bg-slate-50">
                        <th className="p-4 text-sm font-semibold text-slate-600">{t('adminUserAvatar')}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600">{t('adminUserUsername')}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600">{t('adminUserLevel')}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600 text-right">{t('adminUserActions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {allUsers.map(user => (
                        <tr key={user.username} className="border-b hover:bg-slate-100 transition-colors">
                            <td className="p-2">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200" dangerouslySetInnerHTML={{ __html: user.avatar }} />
                            </td>
                            <td className="p-4 font-medium text-slate-800">{user.username}</td>
                            <td className="p-4 text-slate-600">{user.level}</td>
                            <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleEditUser(user)} className="p-1.5 rounded-md hover:bg-blue-100" title={t('adminEditUser')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.username)} className="p-1.5 rounded-md hover:bg-red-100" title={t('adminDeleteUser')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const renderSupportManagement = () => (
        <div className="flex flex-col md:flex-row gap-8 h-[60vh]">
            <aside className="md:w-1/3 h-full overflow-y-auto">
                <ul className="space-y-2 border rounded-lg p-2 bg-slate-50">
                    {allSupportTickets.length > 0 ? allSupportTickets.map(ticket => (
                        <li key={ticket.username}>
                            <button
                                onClick={() => handleSelectTicket(ticket)}
                                className={`w-full text-left p-3 rounded-lg transition-colors text-base font-medium flex justify-between items-center ${selectedTicket?.username === ticket.username ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <span>{ticket.username}</span>
                                {ticket.adminHasUnread && <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
                            </button>
                        </li>
                    )) : (
                         <p className="p-4 text-center text-slate-500">{t('supportNoTickets')}</p>
                    )}
                </ul>
            </aside>
             <main className="flex-1 flex flex-col h-full border rounded-lg">
                {!selectedTicket ? (
                    <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-8">
                        <p className="text-slate-500">{t('supportSelectTicket')}</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-100">
                             {selectedTicket.messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleAdminReplySubmit} className="p-4 border-t bg-white">
                             <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={adminReply}
                                    onChange={(e) => setAdminReply(e.target.value)}
                                    placeholder={t('supportTypeReply')}
                                    className="w-full p-2 border border-slate-500 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!adminReply.trim()}
                                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                                >
                                    {t('supportSend')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </main>
        </div>
    );

    const getTabClass = (tabName: AdminTab) => `py-2 px-4 font-semibold rounded-t-lg transition-colors relative ${activeTab === tabName ? 'bg-white border-b-0 text-blue-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`;

    const unreadSupportTickets = allSupportTickets.some(t => t.adminHasUnread);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-slide-up-fade">
            <div className="flex border-b mb-6">
                <button className={getTabClass('quizzes')} onClick={() => setActiveTab('quizzes')}>{t('adminTabQuizzes')}</button>
                <button className={getTabClass('users')} onClick={() => setActiveTab('users')}>{t('adminTabUsers')}</button>
                <button className={getTabClass('support')} onClick={() => setActiveTab('support')}>
                    {t('adminTabSupport')}
                    {unreadSupportTickets && <span className="absolute top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
            </div>
            
            {activeTab === 'quizzes' && renderQuizManagement()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'support' && renderSupportManagement()}

            {editingQuestion && (
                <EditQuestionModal
                    isOpen={!!editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    question={editingQuestion}
                    onSave={handleSaveEditedQuestion}
                />
            )}
            {editingUser && (
                <EditUserModal
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    user={editingUser}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};