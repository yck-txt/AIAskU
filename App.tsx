import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { QuizCard } from './components/QuizCard';
import { FeedbackCard } from './components/FeedbackCard';
import { Sidebar } from './components/Sidebar';
import { QuizSummary } from './components/QuizSummary';
import { Auth } from './components/Auth';
import { UserStats } from './components/UserStats';
import { QuizAdmin } from './components/QuizAdmin';
import { InteractiveTour } from './components/InteractiveTour';
import { SupportModal } from './components/SupportModal';
import { SaveQuizOptions } from './components/SaveQuizOptions';
import { getTourSteps } from './tourSteps';
import { SUGGESTED_TOPICS } from './constants';
import { getUser, addXPAndLevelUp, saveQuizStat, getAllUsers, updateUserByAdmin, deleteUser as deleteUserService } from './services/userService';
import { generateQuizQuestions, generateQuizQuestionsFromFile } from './services/geminiService';
import { getPublicQuizzes, getPrivateQuizzesForUser, saveQuiz, updateQuiz, deleteQuiz, getAllQuizzes } from './services/quizService';
import { getTicketForUser, sendMessageFromUser, sendMessageFromAdmin, markUserMessagesAsRead, getAllTickets, markAdminMessagesAsRead } from './services/supportService';
import type { Feedback, QuizQuestion, QuizStat, SavedQuiz, User, Difficulty, SupportTicket } from './types';
import { useTranslation } from './locales/i18n';
import { calculateXPForQuiz } from './services/levelService';
import { Leaderboard } from './components/Leaderboard';

const App: React.FC = () => {
  const { t, language } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'quiz' | 'stats' | 'admin' | 'leaderboard'>('quiz');
  
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>('Medium');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const [publicQuizzes, setPublicQuizzes] = useState<SavedQuiz[]>([]);
  const [privateQuizzes, setPrivateQuizzes] = useState<SavedQuiz[]>([]);
  const [isCurrentQuizSavable, setIsCurrentQuizSavable] = useState(false);
  const [quizSaveState, setQuizSaveState] = useState({ public: false, private: false });
  
  // Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Admin state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<SavedQuiz[]>([]);
  const [allSupportTickets, setAllSupportTickets] = useState<SupportTicket[]>([]);

  // Support state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [userSupportTicket, setUserSupportTicket] = useState<SupportTicket | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const tourSteps = React.useMemo(() => getTourSteps({ setView }, t), [setView, t]);

  const loadInitialData = useCallback((user: User) => {
    setCurrentUser(user);
    setAllUsers(getAllUsers());
    setUserSupportTicket(getTicketForUser(user.username));
    setPrivateQuizzes(getPrivateQuizzesForUser(user.username));
    if (user.isAdmin) {
        setAllSupportTickets(getAllTickets());
        setAllQuizzes(getAllQuizzes());
    }
  }, []);

  useEffect(() => {
    const loggedInUsername = localStorage.getItem('currentUser');
    if (loggedInUsername) {
      const user = getUser(loggedInUsername);
      if (user) {
        loadInitialData(user);
      }
    }
    setPublicQuizzes(getPublicQuizzes());
  }, [loadInitialData]);

  const currentQuestion = questions[currentQuestionIndex];
  const isQuizFinished = questions.length > 0 && currentQuestionIndex >= questions.length;
  const isQuizActive = questions.length > 0;

  const resetQuizState = (topic: string, difficulty: Difficulty) => {
    setView('quiz');
    setSelectedTopic(topic);
    setQuizDifficulty(difficulty);
    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setFeedback(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setIsCurrentQuizSavable(false);
    setQuizSaveState({ public: false, private: false });
  };

  const generateNewQuiz = async (topic: string, count: number = 5, difficulty: Difficulty = 'Medium') => {
    resetQuizState(topic, difficulty);
    try {
        const newQuestions = await generateQuizQuestions(topic, language, count, difficulty);
        setQuestions(newQuestions);
        setIsCurrentQuizSavable(true);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(t('errorUnknownQuizGeneration'));
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const generateQuizFromFile = async (topic: string, file: File, count: number = 5, difficulty: Difficulty = 'Medium') => {
    resetQuizState(topic, difficulty);
    try {
        const newQuestions = await generateQuizQuestionsFromFile(topic, file, language, count, difficulty);
        setQuestions(newQuestions);
        setIsCurrentQuizSavable(true);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(t('errorUnknownQuizGeneration'));
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSelectSavedQuiz = (quiz: SavedQuiz) => {
    resetQuizState(quiz.topic, 'Medium');
    setIsGenerating(false);
    setQuestions(quiz.questions);
    setIsCurrentQuizSavable(false);
  };

  const startTour = () => {
    setTourStepIndex(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('hasCompletedTour', 'true');
  };
  
  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('currentUser', user.username);
    loadInitialData(user);
    if (!localStorage.getItem('hasCompletedTour')) {
      setTimeout(() => startTour(), 500);
    }
  };
  
  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setAllUsers([]);
      setUserSupportTicket(null);
      setAllSupportTickets([]);
      setPrivateQuizzes([]);
      setAllQuizzes([]);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleAnswerSubmit = useCallback((selectedOption: string) => {
    if (!currentQuestion) return;
    setFeedback(null);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setFeedback({ isCorrect, explanation: currentQuestion.context });
    setUserAnswers(prev => [...prev, selectedOption]);
  }, [currentQuestion]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length -1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setFeedback(null);
    } else {
       setCurrentQuestionIndex(questions.length);
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setUserAnswers([]);
  };
  
  const handleSaveStat = useCallback(async (stat: Omit<QuizStat, 'date' | 'difficulty'>, difficulty: Difficulty) => {
    if (currentUser) {
        saveQuizStat(currentUser.username, { ...stat, date: new Date().toISOString(), difficulty });
        const xpGained = calculateXPForQuiz(stat.score, stat.totalQuestions, difficulty);
        if (xpGained > 0) {
            const updatedUser = await addXPAndLevelUp(currentUser.username, xpGained, language);
            if (updatedUser) {
              setCurrentUser(updatedUser);
              // Optimistically update allUsers state for leaderboard
              setAllUsers(prevUsers => prevUsers.map(u => u.username === updatedUser.username ? updatedUser : u));
            }
        }
    }
  }, [currentUser, language]);

  const handleSaveQuiz = (visibility: 'public' | 'private') => {
    if (!currentUser) return;
    const quizToSave: Omit<SavedQuiz, 'id'> = {
        topic: selectedTopic,
        questions,
        createdBy: currentUser.username,
        visibility,
    };
    const result = saveQuiz(quizToSave);
    if (result.success) {
        setQuizSaveState(prev => ({...prev, [visibility]: true}));
        // refresh quizzes
        setPublicQuizzes(getPublicQuizzes());
        setPrivateQuizzes(getPrivateQuizzesForUser(currentUser.username));
        if (currentUser.isAdmin) {
            setAllQuizzes(getAllQuizzes());
        }
    } else {
        alert(t(result.message as string));
    }
  };

  // --- Support Handlers ---
  const handleOpenSupportModal = () => {
    if(currentUser) {
        setUserSupportTicket(markUserMessagesAsRead(currentUser.username));
        setIsSupportModalOpen(true);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!currentUser) return;
    setIsSendingMessage(true);
    const result = sendMessageFromUser(currentUser.username, message);
    if (result.success && result.ticket) {
        setUserSupportTicket(result.ticket);
    }
    setIsSendingMessage(false);
  };

  const handleAdminReply = (username: string, message: string) => {
    const result = sendMessageFromAdmin(username, message);
    if (result.success) {
        setAllSupportTickets(getAllTickets());
    }
  };

  const handleAdminViewTicket = (username: string) => {
    markAdminMessagesAsRead(username);
    setAllSupportTickets(getAllTickets());
  };

  // --- Admin Quiz Handlers ---
  const handleUpdateQuiz = (updatedQuiz: SavedQuiz) => {
    const result = updateQuiz(updatedQuiz);
    if (result.success) {
        setPublicQuizzes(getPublicQuizzes());
        if(currentUser) setPrivateQuizzes(getPrivateQuizzesForUser(currentUser.username));
        if(currentUser?.isAdmin) setAllQuizzes(getAllQuizzes());
    }
    else alert(t(result.message as string));
  };

  const handleDeleteQuiz = (quizId: string) => {
    const result = deleteQuiz(quizId);
    if (result.success) {
        setPublicQuizzes(getPublicQuizzes());
        if(currentUser) setPrivateQuizzes(getPrivateQuizzesForUser(currentUser.username));
        if(currentUser?.isAdmin) setAllQuizzes(getAllQuizzes());
    }
    else alert(t(result.message as string));
  };

  const handleRegenerateQuiz = async (quiz: SavedQuiz, count: number, difficulty: Difficulty): Promise<SavedQuiz> => {
    const newQuestions = await generateQuizQuestions(quiz.topic, language, count, difficulty);
    const updatedQuiz: SavedQuiz = { ...quiz, questions: newQuestions };
    handleUpdateQuiz(updatedQuiz);
    return updatedQuiz;
  };

  // --- Admin User Handlers ---
  const handleUpdateUserByAdmin = (updatedUser: User) => {
    const result = updateUserByAdmin(updatedUser);
    if (result.success) setAllUsers(getAllUsers());
    else alert(t(result.message as string));
    return result;
  }

  const handleDeleteUser = (username: string) => {
    const result = deleteUserService(username);
    if (result.success) setAllUsers(getAllUsers());
    else alert(t(result.message as string));
    return result;
  }

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }
  
  const renderMainContent = () => {
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg h-96 animate-slide-up-fade">
                <div className="w-12 h-12">
                    <svg className="animate-spin h-full w-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-700 mt-6">{t('appGeneratingQuiz')}</h2>
                <p className="text-slate-500">{t('appGeneratingQuizFor')} "{selectedTopic}"</p>
            </div>
        );
    }

    if (error && !isQuizActive) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-slide-up-fade">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{t('appErrorGeneratingQuiz')}</h2>
                <p className="text-slate-600">{error}</p>
                <p className="text-slate-500 mt-2">{t('appErrorTryAgain')}</p>
            </div>
        );
    }

    if (!isQuizActive) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-slide-up-fade">
                <h2 className="text-2xl font-bold text-slate-700 mb-4">{t('appWelcome')}</h2>
                <p className="text-slate-500">{t('appSelectTopicPrompt')}</p>
            </div>
        );
    }
    
    if (isQuizFinished) {
        return (
            <QuizSummary
                userAnswers={userAnswers}
                questions={questions}
                totalQuestions={questions.length}
                topic={selectedTopic}
                onRestart={handleRestart}
                onSaveStat={handleSaveStat}
                difficulty={quizDifficulty}
            />
        );
    }

    return (
        <>
            <QuizCard
                key={currentQuestionIndex}
                question={currentQuestion}
                onAnswerSubmit={handleAnswerSubmit}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                isSubmitted={!!feedback}
            />

            {isCurrentQuizSavable && !feedback && (
                <SaveQuizOptions onSave={handleSaveQuiz} saveState={quizSaveState} />
            )}
            
            {feedback && (
                <>
                    <FeedbackCard feedback={feedback} />
                    <div className="mt-6 text-center">
                        <button onClick={handleNextQuestion} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105">
                            {currentQuestionIndex === questions.length - 1 ? t('appFinishQuiz') : t('appNextQuestion')}
                        </button>
                    </div>
                </>
            )}
        </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        onStartTour={startTour}
        onSupport={handleOpenSupportModal}
        hasUnreadSupportMessage={userSupportTicket?.userHasUnread || false}
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row items-start gap-8">
        <Sidebar 
          topics={SUGGESTED_TOPICS} 
          selectedTopic={selectedTopic} 
          onSelectTopic={generateNewQuiz} 
          className="w-full lg:max-w-xs"
          currentView={view}
          onSetView={setView}
          isGenerating={isGenerating}
          publicQuizzes={publicQuizzes}
          privateQuizzes={privateQuizzes}
          onSelectSavedQuiz={handleSelectSavedQuiz}
          onGenerateFromFile={generateQuizFromFile}
          user={currentUser}
        />
        <main className="flex-1 w-full">
            {view === 'stats' && <UserStats user={currentUser} onUserUpdate={handleUserUpdate} />}
            {view === 'quiz' && renderMainContent()}
            {view === 'leaderboard' && <Leaderboard allUsers={allUsers} currentUser={currentUser} />}
            {view === 'admin' && (
                <QuizAdmin 
                    allQuizzes={allQuizzes} 
                    onUpdateQuiz={handleUpdateQuiz}
                    onDeleteQuiz={handleDeleteQuiz}
                    onRegenerateQuiz={handleRegenerateQuiz}
                    allUsers={allUsers.filter(u => u.username !== currentUser.username)}
                    onUpdateUser={handleUpdateUserByAdmin}
                    onDeleteUser={handleDeleteUser}
                    allSupportTickets={allSupportTickets}
                    onAdminReply={handleAdminReply}
                    onAdminViewTicket={handleAdminViewTicket}
                />
            )}
        </main>
      </div>
       {currentUser && (
            <InteractiveTour
                steps={tourSteps}
                isOpen={isTourOpen}
                onClose={closeTour}
                stepIndex={tourStepIndex}
                setStepIndex={setTourStepIndex}
            />
       )}
       {isSupportModalOpen && (
            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                ticket={userSupportTicket}
                onSendMessage={handleSendMessage}
                isLoading={isSendingMessage}
            />
       )}
       <style>{`
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-fade {
          animation: slide-up-fade 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
