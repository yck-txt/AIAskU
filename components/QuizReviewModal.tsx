
import React from 'react';
import type { QuizStat } from '../types';
import { useTranslation } from '../locales/i18n';

interface QuizReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizStat: QuizStat | null;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);
  
const XIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const QuizReviewModal: React.FC<QuizReviewModalProps> = ({ isOpen, onClose, quizStat }) => {
    const { t } = useTranslation();
    if (!isOpen || !quizStat) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up-fade"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white rounded-t-xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t('reviewModalTitle')}: <span className="text-blue-600">{quizStat.topic}</span></h2>
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
                <main className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                    {quizStat.questions.map((q, index) => {
                        const userAnswer = quizStat.userAnswers[index];
                        const isCorrect = userAnswer === q.correctAnswer;
                        return (
                            <div key={q.id || index} className="border-b pb-6 last:border-b-0">
                                <p className="font-semibold text-slate-800 mb-3">
                                    <span className="font-bold">{t('reviewModalQuestionLabel')}{index + 1}:</span> {q.question}
                                </p>
                                <ul className="space-y-2">
                                    {q.options.map(option => {
                                        const isUserAnswer = option === userAnswer;
                                        const isCorrectAnswer = option === q.correctAnswer;
                                        let optionClasses = 'p-3 rounded-lg border text-sm flex items-center justify-between';
                                        let icon = null;

                                        if (isCorrectAnswer) {
                                            optionClasses += ' bg-green-100 border-green-300 font-semibold text-green-800';
                                            icon = <CheckIcon className="text-green-600" />;
                                        } else if (isUserAnswer) { // and not correct answer
                                            optionClasses += ' bg-red-100 border-red-300 text-red-800 line-through';
                                            icon = <XIcon className="text-red-600"/>;
                                        } else {
                                            optionClasses += ' bg-slate-50 border-slate-200 text-slate-600';
                                        }

                                        return (
                                            <li key={option} className={optionClasses}>
                                                <span>{option}</span>
                                                {icon}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {!isCorrect && (
                                    <p className="text-sm text-slate-600 mt-3 p-2 bg-yellow-50 rounded-md">
                                        <strong>{t('reviewModalExplanation')}:</strong> {q.context}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </main>
                <footer className="p-4 border-t sticky bottom-0 bg-white rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto sm:float-right bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
                    >
                        {t('reviewModalClose')}
                    </button>
                </footer>
            </div>
        </div>
    );
};