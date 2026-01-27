import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationDE from './locales/de.json';
import translationIT from './locales/it.json';
import translationPT from './locales/pt.json';

const resources = {
    fr: { translation: translationFR },
    en: { translation: translationEN },
    es: { translation: translationES },
    de: { translation: translationDE },
    it: { translation: translationIT },
    pt: { translation: translationPT }
};

i18n
    .use(LanguageDetector) // Détecte la langue du navigateur automatiquement
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr', // Langue par défaut si la traduction manque
        interpolation: {
            escapeValue: false // React protège déjà contre XSS
        }
    });

export default i18n;