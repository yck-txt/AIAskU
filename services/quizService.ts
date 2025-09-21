import type { SavedQuiz } from '../types';

const QUIZZES_KEY = 'quiz_quizzes';

/**
 * Retrieves all quizzes from local storage, migrating old data if necessary.
 * @returns An array of SavedQuiz objects.
 */
const getQuizzes = (): SavedQuiz[] => {
    try {
        const quizzesJson = localStorage.getItem(QUIZZES_KEY);
        if (quizzesJson) {
            const quizzes = JSON.parse(quizzesJson);
            if (quizzes.length > 0 && !quizzes[0].visibility) {
                // Old structure detected, migrate it
                const migratedQuizzes = quizzes.map((q: any) => ({
                    ...q,
                    id: `${Date.now()}-${Math.random()}`,
                    createdBy: 'admin', // Assume old quizzes were by an admin
                    visibility: 'public'
                }));
                saveQuizzes(migratedQuizzes);
                return migratedQuizzes;
            }
            return quizzes;
        }
        return [];
    } catch (error) {
        console.error("Failed to parse quizzes from localStorage:", error);
        return [];
    }
};

const saveQuizzes = (quizzes: SavedQuiz[]) => {
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
};

export const getAllQuizzes = (): SavedQuiz[] => {
    return getQuizzes();
};

export const getPublicQuizzes = (): SavedQuiz[] => {
    return getQuizzes().filter(q => q.visibility === 'public');
};

export const getPrivateQuizzesForUser = (username: string): SavedQuiz[] => {
    return getQuizzes().filter(q => q.createdBy === username && q.visibility === 'private');
};

export const saveQuiz = (quizToSave: Omit<SavedQuiz, 'id'>): { success: boolean, message: string } => {
    if (!quizToSave.topic || quizToSave.questions.length === 0) {
        return { success: false, message: 'errorInvalidQuizData' };
    }
    
    const quizzes = getQuizzes();

    if (quizToSave.visibility === 'public') {
        const publicTopicExists = quizzes.some(q =>
            q.visibility === 'public' && q.topic.toLowerCase() === quizToSave.topic.toLowerCase()
        );
        if (publicTopicExists) {
            return { success: false, message: 'errorQuizTopicExistsPublic' };
        }
    } else { // private
        const privateTopicExists = quizzes.some(q =>
            q.visibility === 'private' &&
            q.createdBy === quizToSave.createdBy &&
            q.topic.toLowerCase() === quizToSave.topic.toLowerCase()
        );
        if (privateTopicExists) {
            return { success: false, message: 'errorQuizTopicExistsPrivate' };
        }
    }
    
    const newQuiz: SavedQuiz = {
        ...quizToSave,
        id: `${Date.now()}-${quizToSave.topic.replace(/\s/g, '-')}`
    };

    quizzes.unshift(newQuiz);
    try {
        saveQuizzes(quizzes);
        return { success: true, message: 'successQuizSaved' };
    } catch (error) {
        console.error("Failed to save quiz to localStorage:", error);
        return { success: false, message: 'errorFailedToSaveQuiz' };
    }
};

export const updateQuiz = (quizToUpdate: SavedQuiz): { success: boolean, message: string } => {
    const quizzes = getQuizzes();
    const quizIndex = quizzes.findIndex(q => q.id === quizToUpdate.id);

    if (quizIndex === -1) {
        return { success: false, message: 'errorQuizNotFound' };
    }

    quizzes[quizIndex] = quizToUpdate;
    try {
        saveQuizzes(quizzes);
        return { success: true, message: 'successQuizUpdated' };
    } catch (error) {
        console.error("Failed to update quiz in localStorage:", error);
        return { success: false, message: 'errorFailedToUpdateQuiz' };
    }
};

export const deleteQuiz = (quizId: string): { success: boolean, message: string } => {
    let quizzes = getQuizzes();
    const initialLength = quizzes.length;
    quizzes = quizzes.filter(q => q.id !== quizId);

    if (quizzes.length === initialLength) {
        return { success: false, message: 'errorQuizNotFound' };
    }

    try {
        saveQuizzes(quizzes);
        return { success: true, message: 'successQuizDeleted' };
    } catch (error) {
        console.error("Failed to delete quiz from localStorage:", error);
        return { success: false, message: 'errorFailedToDeleteQuiz' };
    }
};