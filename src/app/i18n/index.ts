import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import {getOptions, Locale, defaultNS, i18n} from './settings';

const initI18next = async (lang: Locale, ns: string | string[] = defaultNS) => {
    const i18nInstance = createInstance();
    await i18nInstance
        .use(initReactI18next)
        .use(
            resourcesToBackend(
                (language: string, namespace: string) =>
                    import(`../../../public/locales/${language}/${namespace}.json`)
            )
        )
        .init({
            ...getOptions(),
            lng: lang,
            ns: ns,
        });
    return i18nInstance;
};

export async function getTranslation(lang: Locale, ns?: string | string[]) {
    const i18nextInstance = await initI18next(lang, ns);
    return {
        t: i18nextInstance.getFixedT(lang, Array.isArray(ns) ? ns[0] : ns),
        i18n: i18nextInstance,
    };
}

// New function to get the current language from localStorage or fallback
export function getCurrentLanguage(): Locale {
    const storedLang = localStorage.getItem('language') as Locale;
    return storedLang || i18n.defaultLocale;
}