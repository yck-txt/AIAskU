
import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import { useTranslation } from '../locales/i18n';

interface QuizCardProps {
  question: QuizQuestion;
  onAnswerSubmit: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
  isSubmitted: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswerSubmit, questionNumber, totalQuestions, isSubmitted }) => {
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [question]);

  const handleOptionClick = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(option);
    onAnswerSubmit(option);
  };

  const getButtonClasses = (option: string) => {
    const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium text-slate-700 disabled:cursor-not-allowed";
    
    if (isSubmitted) {
      if (option === question.correctAnswer) {
        return `${baseClasses} bg-green-100 border-green-500 text-green-800`;
      }
      if (option === selectedAnswer) {
        return `${baseClasses} bg-red-100 border-red-500 text-red-800`;
      }
      return `${baseClasses} bg-slate-100 border-slate-200 text-slate-500 disabled:opacity-70`;
    }
    
    if (option === selectedAnswer) {
        return `${baseClasses} bg-blue-100 border-blue-500 ring-2 ring-blue-300`;
    }

    return `${baseClasses} bg-white border-slate-300 hover:bg-blue-50 hover:border-blue-400`;
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg transition-all duration-500 animate-slide-up-fade">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-700">{t('quizCardQuestion')}</h2>
        <span className="text-sm font-medium text-slate-500">{questionNumber} / {totalQuestions}</span>
      </div>
      <p className="text-base sm:text-lg text-slate-800 mb-6">{question.question}</p>
      
      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            disabled={isSubmitted}
            className={getButtonClasses(option)}
            aria-pressed={selectedAnswer === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};