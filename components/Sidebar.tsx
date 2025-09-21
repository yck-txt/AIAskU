import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import type { SavedQuiz, Difficulty, User } from '../types';
import { useTranslation } from '../locales/i18n';

interface SidebarProps {
  topics: string[];
  selectedTopic: string;
  onSelectTopic: (topic: string, count: number, difficulty: Difficulty) => void;
  className?: string;
  currentView: 'quiz' | 'stats' | 'admin' | 'leaderboard';
  onSetView: (view: 'quiz' | 'stats' | 'admin' | 'leaderboard') => void;
  isGenerating: boolean;
  publicQuizzes: SavedQuiz[];
  privateQuizzes: SavedQuiz[];
  onSelectSavedQuiz: (quiz: SavedQuiz) => void;
  onGenerateFromFile: (topic: string, file: File, count: number, difficulty: Difficulty) => void;
  user: User | null;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; id?: string }> = ({ title, children, defaultOpen = false, id }) => (
    <details className="border-t py-4" open={defaultOpen} id={id}>
        <summary className="font-bold text-lg text-slate-700 cursor-pointer hover:text-blue-600 transition-colors">{title}</summary>
        <div className="mt-3">
            {children}
        </div>
    </details>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
    topics, 
    selectedTopic, 
    onSelectTopic, 
    className = '', 
    currentView, 
    onSetView, 
    isGenerating,
    publicQuizzes,
    privateQuizzes,
    onSelectSavedQuiz,
    onGenerateFromFile,
    user,
}) => {
  const { t } = useTranslation();
  const [customTopic, setCustomTopic] = useState('');
  const [fileTopic, setFileTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  
  const handleSelectSuggestedTopic = (topic: string) => {
    onSetView('quiz');
    // Use default values for suggested topics
    onSelectTopic(topic, 5, 'Medium');
  };

  const handleSelectSavedQuiz = (quiz: SavedQuiz) => {
    onSetView('quiz');
    onSelectSavedQuiz(quiz);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim() && !isGenerating) {
        onSetView('quiz');
        onSelectTopic(customTopic.trim(), questionCount, difficulty);
        setCustomTopic('');
    }
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileTopic.trim() && file && !isGenerating) {
        onSetView('quiz');
        onGenerateFromFile(fileTopic.trim(), file, questionCount, difficulty);
        setFileTopic('');
        setFile(null);
        // Clear the file input visually
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }
  };

  const getButtonClasses = (topic: string) => {
      return `w-full text-left p-3 rounded-lg transition-colors duration-200 text-base font-medium disabled:opacity-50 ${
        selectedTopic === topic && currentView === 'quiz'
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`;
  };

  const getNavButtonClasses = (viewName: 'quiz' | 'stats' | 'admin' | 'leaderboard') => {
    return `w-full text-left p-3 rounded-lg transition-colors duration-200 text-base font-medium disabled:opacity-50 ${
      currentView === viewName
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
    }`;
  };

  const inputClasses = "w-full p-2 border border-slate-500 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-600 placeholder:text-slate-400";
    
  return (
    <aside className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
      <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-3">{t('sidebarDashboard')}</h2>
      <nav className="mb-4">
        <ul className="space-y-2">
            <li>
              <button
                id="tour-my-stats"
                onClick={() => onSetView('stats')}
                disabled={isGenerating}
                className={getNavButtonClasses('stats')}
              >
                {t('sidebarMyStats')}
              </button>
            </li>
            <li>
              <button
                onClick={() => onSetView('leaderboard')}
                disabled={isGenerating}
                className={getNavButtonClasses('leaderboard')}
              >
                {t('sidebarLeaderboard')}
              </button>
            </li>
            {user?.isAdmin && (
              <li>
                <button
                  onClick={() => onSetView('admin')}
                  disabled={isGenerating}
                  className={getNavButtonClasses('admin')}
                >
                  {t('sidebarAdmin')}
                </button>
              </li>
            )}
        </ul>
      </nav>

      <CollapsibleSection title={t('sidebarPublicQuizzes')} defaultOpen id="tour-public-quizzes">
        {publicQuizzes.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {publicQuizzes.map((quiz) => (
                <li key={quiz.id}>
                <button
                    onClick={() => handleSelectSavedQuiz(quiz)}
                    disabled={isGenerating}
                    className={getButtonClasses(quiz.topic)}
                >
                    {quiz.topic}
                </button>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-500">{t('sidebarNoPublicQuizzes')}</p>
        )}
      </CollapsibleSection>

      <CollapsibleSection title={t('sidebarPrivateQuizzes')}>
        {privateQuizzes.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {privateQuizzes.map((quiz) => (
                <li key={quiz.id}>
                <button
                    onClick={() => handleSelectSavedQuiz(quiz)}
                    disabled={isGenerating}
                    className={getButtonClasses(quiz.topic)}
                >
                    {quiz.topic}
                </button>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-500">{t('sidebarNoPrivateQuizzes')}</p>
        )}
      </CollapsibleSection>

      <CollapsibleSection title={t('sidebarSuggestedTopics')} id="tour-suggested-topics">
         <ul className="space-y-2">
          {topics.map((topic) => (
            <li key={topic}>
              <button
                onClick={() => handleSelectSuggestedTopic(topic)}
                disabled={isGenerating}
                className={getButtonClasses(topic)}
              >
                {topic}
              </button>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
      
      <CollapsibleSection title={t('sidebarCustomTopic')} id="tour-custom-topic">
        <form onSubmit={handleCustomSubmit} className="space-y-3">
            <input 
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder={t('sidebarCustomTopicPlaceholder')}
                className={inputClasses}
                disabled={isGenerating}
            />
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1" htmlFor="custom-question-count">{t('sidebarNumberOfQuestions')}</label>
                    <input 
                        type="number"
                        id="custom-question-count"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                        min="3"
                        max="50"
                        className={inputClasses}
                        disabled={isGenerating}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1" htmlFor="custom-difficulty">{t('sidebarDifficulty')}</label>
                    <select
                        id="custom-difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className={inputClasses}
                        disabled={isGenerating}
                    >
                        <option value="Easy">{t('sidebarDifficultyEasy')}</option>
                        <option value="Medium">{t('sidebarDifficultyMedium')}</option>
                        <option value="Hard">{t('sidebarDifficultyHard')}</option>
                    </select>
                </div>
            </div>
            <button
                type="submit"
                disabled={isGenerating || !customTopic.trim()}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center h-10"
            >
                {isGenerating && selectedTopic === customTopic.trim() ? <LoadingSpinner /> : t('sidebarGenerateQuiz')}
            </button>
        </form>
      </CollapsibleSection>

      <CollapsibleSection title={t('sidebarUploadGenerate')} id="tour-upload-generate">
        <form onSubmit={handleFileSubmit} className="space-y-3">
             <input 
                type="text"
                value={fileTopic}
                onChange={(e) => setFileTopic(e.target.value)}
                placeholder={t('sidebarUploadTopicPlaceholder')}
                className={inputClasses}
                disabled={isGenerating}
                required
            />
            <input 
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                disabled={isGenerating}
                required
            />
             <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1" htmlFor="file-question-count">{t('sidebarNumberOfQuestions')}</label>
                    <input 
                        type="number"
                        id="file-question-count"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                        min="3"
                        max="50"
                        className={inputClasses}
                        disabled={isGenerating}
                    />
                </div>
                <div>
                    <label className="text-sm text-white font-medium text-slate-600  block mb-1" htmlFor="file-difficulty">{t('sidebarDifficulty')}</label>
                    <select
                        id="file-difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className={inputClasses}
                        disabled={isGenerating}
                    >
                        <option value="Easy">{t('sidebarDifficultyEasy')}</option>
                        <option value="Medium">{t('sidebarDifficultyMedium')}</option>
                        <option value="Hard">{t('sidebarDifficultyHard')}</option>
                    </select>
                </div>
            </div>
            <button
                type="submit"
                disabled={isGenerating || !fileTopic.trim() || !file}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center h-10"
            >
                {isGenerating && selectedTopic === fileTopic.trim() ? <LoadingSpinner /> : t('sidebarGenerateFromFile')}
            </button>
        </form>
      </CollapsibleSection>
    </aside>
  );
};