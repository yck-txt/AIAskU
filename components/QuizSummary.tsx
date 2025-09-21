
import React, { useEffect } from 'react';
import type { QuizQuestion, QuizStat, Difficulty } from '../types';
import { Confetti } from './Confetti';
import { useTranslation } from '../locales/i18n';

interface QuizSummaryProps {
  userAnswers: string[];
  questions: QuizQuestion[];
  totalQuestions: number;
  topic: string;
  onRestart: () => void;
  onSaveStat: (stat: Omit<QuizStat, 'date' | 'difficulty'>, difficulty: Difficulty) => void;
  difficulty: Difficulty;
}

const CheckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


export const QuizSummary: React.FC<QuizSummaryProps> = ({ userAnswers, questions, totalQuestions, topic, onRestart, onSaveStat, difficulty }) => {
  const { t } = useTranslation();
  const correctAnswers = userAnswers.filter((answer, i) => questions[i] && questions[i].correctAnswer === answer).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Save stats when the component mounts
  useEffect(() => {
    onSaveStat({
        topic,
        score: correctAnswers,
        totalQuestions,
        questions,
        userAnswers,
    }, difficulty);
  }, []); // Empty dependency array ensures this runs only once on mount

  let performanceMessage: string;
  if (scorePercentage === 100) {
    performanceMessage = t('summaryPerfect');
  } else if (scorePercentage >= 80) {
    performanceMessage = t('summaryGreat');
  } else if (scorePercentage >= 50) {
    performanceMessage = t('summaryGood');
  } else {
    performanceMessage = t('summaryPractice');
  }

  return (
    <div className="text-center bg-white p-8 rounded-xl shadow-lg transition-all duration-500 animate-slide-up-fade">
      {scorePercentage === 100 && <Confetti />}
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-2">{t('summaryComplete')}</h2>
      <p className="text-slate-600 mb-6">{t('summaryFinished')} <span className="font-semibold">{topic}</span> {t('summaryQuiz')}.</p>
      
      <div className="mb-8">
        <p className="text-lg text-slate-500">{performanceMessage}</p>
        <p className="text-6xl font-bold text-blue-600 my-2">{scorePercentage}%</p>
        <p className="text-lg font-medium text-slate-700">
            {t('summaryYouAnswered')} {correctAnswers} {t('summaryOutOf')} {totalQuestions} {t('summaryQuestionsCorrectly')}.
        </p>
      </div>

      <div className="flex justify-center gap-8 text-left mb-8">
          <div className="flex items-center gap-3">
              <CheckIcon/>
              <div>
                  <p className="font-bold text-slate-700 text-lg">{correctAnswers}</p>
                  <p className="text-sm text-slate-500">{t('summaryCorrect')}</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <XIcon />
              <div>
                  <p className="font-bold text-slate-700 text-lg">{incorrectAnswers}</p>
                  <p className="text-sm text-slate-500">{t('summaryIncorrect')}</p>
              </div>
          </div>
      </div>
      
      <button
        onClick={onRestart}
        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
      >
        {t('summaryRestart')}
      </button>
    </div>
  );
};
