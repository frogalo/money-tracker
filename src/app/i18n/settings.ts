export const i18n = {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
}

export const defaultNS = 'translation';
export function getOptions () {
    return {
        // debug: true,
        supportedLngs: i18n.locales,
        fallbackLng: i18n.defaultLocale,
        defaultNS,
        ns: defaultNS,
        backend: {
            loadPath: './locales/{{lng}}/{{ns}}.json'
        }
    }
}

export type Locale = (typeof i18n)['locales'][number]