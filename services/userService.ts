
// NOTE: This is a simple localStorage-based service for demonstration.
// In a real-world application, never store plain text passwords.
// Use a secure backend with password hashing.

import type { QuizStat, User } from '../types';
import { calculateLevelInfo } from './levelService';
import { generateLevelBadge } from './geminiService';

const USERS_KEY = 'quiz_users';
const STATS_KEY = 'quiz_stats';
const ADMIN_CODE = 'CurrywurstBerlin1949';

// --- User Management ---

const getUsers = (): User[] => {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const isUsernameTaken = (username: string): boolean => {
  const users = getUsers();
  return users.some(user => user.username.toLowerCase() === username.toLowerCase());
};

export const registerUser = (newUser: Omit<User, 'level' | 'xp' | 'badges' | 'isAdmin'>, adminCode?: string): { success: boolean, message: string } => {
  if (isUsernameTaken(newUser.username)) {
    return { success: false, message: 'errorUsernameTaken' };
  }

  const users = getUsers();
  const fullUser: User = {
      ...newUser,
      level: 1,
      xp: 0,
      badges: [],
      isAdmin: adminCode === ADMIN_CODE,
  };
  users.push(fullUser);
  saveUsers(users);
  return { success: true, message: 'successRegistration' };
};

export const loginUser = (username: string, password: string): { success: boolean, message: string, user: User | null } => {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return { success: false, message: 'errorUserNotFound', user: null };
  }
  if (user.password !== password) {
    return { success: false, message: 'errorIncorrectPassword', user: null };
  }

  return { success: true, message: 'successLogin', user };
};

export const getUser = (username: string): User | null => {
    const users = getUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
};

export const updateUserAvatar = (username: string, newAvatar: string): User | null => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());

    if (userIndex === -1) {
        return null;
    }
    
    users[userIndex].avatar = newAvatar;

    try {
        saveUsers(users);
        return users[userIndex];
    } catch (error) {
        console.error("Failed to update user avatar in localStorage:", error);
        return null;
    }
};

export const promoteUserToAdmin = (username: string, code: string): { success: boolean, message: string, user: User | null } => {
    if (code !== ADMIN_CODE) {
        return { success: false, message: 'statsAdminFailure', user: null };
    }
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
        return { success: false, message: 'errorUserNotFound', user: null };
    }

    users[userIndex].isAdmin = true;
    saveUsers(users);
    
    return { success: true, message: 'statsAdminSuccess', user: users[userIndex] };
}

export const addXPAndLevelUp = async (username: string, xpGained: number, language: string): Promise<User | null> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) return null;

    const user = users[userIndex];
    const oldLevelInfo = calculateLevelInfo(user.xp);
    user.xp += xpGained;
    const newLevelInfo = calculateLevelInfo(user.xp);

    user.level = newLevelInfo.level;

    // Check if the user has leveled up
    if (newLevelInfo.level > oldLevelInfo.level) {
        // Generate badges for all new levels achieved
        for (let i = oldLevelInfo.level + 1; i <= newLevelInfo.level; i++) {
            try {
                const badgeInfo = await generateLevelBadge(i, language);
                user.badges.push({ level: i, ...badgeInfo });
            } catch (error) {
                console.error(`Failed to generate badge for level ${i}:`, error);
                // Still add a placeholder badge so the user knows they earned something
                user.badges.push({ 
                    level: i, 
                    name: `Level ${i} Badge`, 
                    svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="grey"/><text x="50" y="60" font-size="30" fill="white" text-anchor="middle">?</text></svg>'
                });
            }
        }
    }
    
    users[userIndex] = user;
    saveUsers(users);
    return user;
};


// --- Stats Management ---

export const saveQuizStat = (username: string, stat: QuizStat) => {
  const allStats: Record<string, QuizStat[]> = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  if (!allStats[username]) {
    allStats[username] = [];
  }
  allStats[username].unshift(stat); // Add to the beginning of the array
  localStorage.setItem(STATS_KEY, JSON.stringify(allStats));
};

export const getQuizStats = (username: string): QuizStat[] => {
  const allStats: Record<string, QuizStat[]> = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  return allStats[username] || [];
};

// --- Admin User Management ---

export const getAllUsers = (): User[] => {
    return getUsers();
};

export const updateUserByAdmin = (updatedUser: User): { success: boolean, message: string } => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === updatedUser.username);
    if (userIndex === -1) {
        return { success: false, message: 'errorUserNotFound' };
    }
    users[userIndex] = updatedUser;
    saveUsers(users);
    return { success: true, message: 'adminSuccessUserUpdated' };
};

export const deleteUser = (username: string): { success: boolean, message: string } => {
    let users = getUsers();
    const initialLength = users.length;
    users = users.filter(u => u.username !== username);
    if (users.length === initialLength) {
        return { success: false, message: 'errorUserNotFound' };
    }
    saveUsers(users);
    // Also delete their stats
    const allStats: Record<string, QuizStat[]> = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    delete allStats[username];
    localStorage.setItem(STATS_KEY, JSON.stringify(allStats));

    return { success: true, message: 'adminSuccessUserDeleted' };
};
