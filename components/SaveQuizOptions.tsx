import React from 'react';
import { useTranslation } from '../locales/i18n';

interface SaveQuizOptionsProps {
    onSave: (visibility: 'public' | 'private') => void;
    saveState: { public: boolean, private: boolean };
}

export const SaveQuizOptions: React.FC<SaveQuizOptionsProps> = ({ onSave, saveState }) => {
    const { t } = useTranslation();

    return (
        <div className="mt-6 p-6 bg-slate-50 border rounded-xl animate-slide-up-fade">
            <h3 className="text-lg font-bold text-slate-700 mb-4">{t('saveOptionsTitle')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
                {/* Public Save */}
                <div className="p-4 border rounded-lg bg-white">
                    <h4 className="font-semibold text-slate-800">{t('saveAsPublic')}</h4>
                    <p className="text-sm text-slate-500 my-2">{t('savePublicInfo')}</p>
                    {saveState.public ? (
                        <span className="w-full text-center block bg-green-100 text-green-700 font-bold py-2 px-4 rounded-lg">
                            {t('savedAsPublic')}
                        </span>
                    ) : (
                        <button
                            onClick={() => onSave('public')}
                            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
                        >
                            {t('saveAsPublic')}
                        </button>
                    )}
                </div>
                {/* Private Save */}
                <div className="p-4 border rounded-lg bg-white">
                    <h4 className="font-semibold text-slate-800">{t('saveAsPrivate')}</h4>
                    <p className="text-sm text-slate-500 my-2">{t('savePrivateInfo')}</p>
                     {saveState.private ? (
                        <span className="w-full text-center block bg-green-100 text-green-700 font-bold py-2 px-4 rounded-lg">
                            {t('savedAsPrivate')}
                        </span>
                    ) : (
                        <button
                            onClick={() => onSave('private')}
                            className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-colors"
                        >
                            {t('saveAsPrivate')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};