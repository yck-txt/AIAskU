
import type { Difficulty } from '../types';

const BASE_XP_PER_LEVEL = 100;
const LEVEL_GROWTH_FACTOR = 1.1;

const BASE_XP_PER_QUESTION = 10;
const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
    'Easy': 1,
    'Medium': 1.5,
    'Hard': 2,
};

/**
 * Calculates the amount of XP required to advance from a given level to the next.
 * @param level The current level.
 * @returns The XP needed to reach the next level.
 */
export const getXPForNextLevel = (level: number): number => {
    return Math.floor(BASE_XP_PER_LEVEL * (level ** LEVEL_GROWTH_FACTOR));
};

/**
 * Calculates the total XP required to have reached a specific level.
 * @param level The target level.
 * @returns The total XP accumulated to reach that level's start.
 */
export const getXPForLevel = (level: number): number => {
    let totalXp = 0;
    for (let i = 1; i < level; i++) {
        totalXp += getXPForNextLevel(i);
    }
    return totalXp;
};


/**
 * Calculates a user's level, progress, and XP details based on their total accumulated XP.
 * @param totalXp The user's total experience points.
 * @returns An object containing the user's current level, XP within that level, and XP needed for the next level.
 */
export const calculateLevelInfo = (totalXp: number) => {
    let level = 1;
    let xpForNext = getXPForNextLevel(level);
    let remainingXp = totalXp;

    while (remainingXp >= xpForNext) {
        remainingXp -= xpForNext;
        level++;
        xpForNext = getXPForNextLevel(level);
    }

    return {
        level,
        xpInLevel: remainingXp,
        xpForNextLevel: xpForNext,
        progress: (remainingXp / xpForNext) * 100,
        totalXp,
    };
};

/**
 * Calculates the XP gained from a quiz based on performance and difficulty.
 * @param score The number of correct answers.
 * @param totalQuestions The total number of questions in the quiz.
 * @param difficulty The difficulty of the quiz.
 * @returns The total XP awarded for the quiz.
 */
export const calculateXPForQuiz = (score: number, totalQuestions: number, difficulty: Difficulty): number => {
    const multiplier = DIFFICULTY_MULTIPLIER[difficulty] || 1;
    return Math.floor(score * BASE_XP_PER_QUESTION * multiplier);
};
