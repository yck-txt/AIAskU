
import type { TourStep } from './types';

type TourActions = {
    setView: (view: 'quiz' | 'stats') => void;
}
type TFunction = (key: string) => string;


export const getTourSteps = (actions: TourActions, t: TFunction): TourStep[] => [
    {
        target: 'body',
        title: t('tourWelcomeTitle'),
        content: t('tourWelcomeContent'),
    },
    {
        target: '#tour-my-stats',
        title: t('tourTrackProgressTitle'),
        content: t('tourTrackProgressContent'),
        action: () => actions.setView('quiz'), // Ensure we start from the quiz view
    },
    {
        target: '#tour-generate-avatar',
        title: t('tourPersonalizeProfileTitle'),
        content: t('tourPersonalizeProfileContent'),
        action: () => actions.setView('stats'), // Switch to stats view to show the button
    },
    {
        target: '#tour-public-quizzes',
        title: t('tourCommunityQuizzesTitle'),
        content: t('tourCommunityQuizzesContent'),
        action: () => actions.setView('quiz'), // Switch back to quiz view
    },
    {
        target: '#tour-suggested-topics',
        title: t('tourSuggestedTopicsTitle'),
        content: t('tourSuggestedTopicsContent'),
    },
    {
        target: '#tour-custom-topic',
        title: t('tourCreateYourOwnTitle'),
        content: t('tourCreateYourOwnContent'),
    },
    {
        target: '#tour-upload-generate',
        title: t('tourQuizFromFileTitle'),
        content: t('tourQuizFromFileContent'),
    },
    {
        target: 'body',
        title: t('tourAllSetTitle'),
        content: t('tourAllSetContent'),
    }
];