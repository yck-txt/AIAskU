
import React from 'react';
import type { Feedback } from '../types';
import { useTranslation } from '../locales/i18n';

interface FeedbackCardProps {
  feedback: Feedback | null;
}

const CorrectIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IncorrectIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  const { t } = useTranslation();
  if (!feedback) return null;

  const isCorrect = feedback.isCorrect;
  const cardClasses = isCorrect
    ? 'bg-green-50 border-green-500'
    : 'bg-red-50 border-red-500';
  const titleClasses = isCorrect ? 'text-green-800' : 'text-red-800';
  const textClasses = isCorrect ? 'text-green-700' : 'text-red-700';

  return (
    <div className={`mt-6 p-4 border-l-4 rounded-r-lg ${cardClasses} animate-slide-up-fade`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-bold ${titleClasses}`}>
            {isCorrect ? t('feedbackCorrect') : t('feedbackNeedsReview')}
          </h3>
          <div className={`mt-2 text-base ${textClasses}`}>
            <p>{feedback.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};