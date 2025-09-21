import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import { useTranslation } from '../locales/i18n';

interface EditQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    question: QuizQuestion;
    onSave: (updatedQuestion: QuizQuestion) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({ isOpen, onClose, question, onSave }) => {
    const { t } = useTranslation();
    const [editedQuestion, setEditedQuestion] = useState<QuizQuestion>(question);

    useEffect(() => {
        setEditedQuestion(question);
    }, [question]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditedQuestion({ ...editedQuestion, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...editedQuestion.options];
        newOptions[index] = value;
        setEditedQuestion({ ...editedQuestion, options: newOptions });
    };
    
    const handleCorrectAnswerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedQuestion);
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up-fade"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 sm:p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-800">{t('modalEditQuestionTitle')}</h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200" aria-label={t('reviewModalClose')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <main className="p-4 sm:p-6 space-y-4">
                        <div>
                            <label htmlFor="question" className={labelClasses}>{t('modalQuestionLabel')}</label>
                            <textarea id="question" name="question" value={editedQuestion.question} onChange={handleInputChange} rows={3} className={inputClasses} required />
                        </div>
                        <div>
                            <label className={labelClasses}>{t('modalOptionsLabel')}</label>
                            <div className="space-y-2">
                                {editedQuestion.options.map((option, index) => (
                                    <input key={index} type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className={inputClasses} required />
                                ))}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="correctAnswer" className={labelClasses}>{t('modalCorrectAnswerLabel')}</label>
                            <select id="correctAnswer" value={editedQuestion.correctAnswer} onChange={handleCorrectAnswerChange} className={inputClasses} required>
                                {editedQuestion.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="context" className={labelClasses}>{t('modalContextLabel')}</label>
                            <textarea id="context" name="context" value={editedQuestion.context} onChange={handleInputChange} rows={2} className={inputClasses} required />
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