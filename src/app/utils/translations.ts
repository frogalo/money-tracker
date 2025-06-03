import { TFunction, TOptions } from 'i18next';
import { getTranslation } from '@/app/i18n';
import { Locale } from '@/app/i18n/settings';
import { FallbackTextKeys, fallbackTexts } from '@/app/i18n/fallbackTexts';
import { UserSettings } from '@/app/types/settings';

export const initTranslations = async (
    userSettings: UserSettings
): Promise<TFunction | null> => {
    try {
        const { t: loadedT } = await getTranslation(
            userSettings.language as Locale,
            'translation'
        );

        if (loadedT && typeof loadedT === 'function') {
            return loadedT;
        } else {
            console.warn(
                'getTranslation did not return a valid translation function. Using fallback.'
            );
            return null;
        }
    } catch (error) {
        console.error('Failed to load i18next translations:', error);
        return null;
    }
};

export const createSafeTranslation = (
    t: TFunction | null
): ((key: string, options?: TOptions) => string) => {
    return (key: string, options?: TOptions): string => {
        if (t && typeof t === 'function') {
            try {
                return t(key, options);
            } catch (error) {
                console.warn(
                    `Translation error with i18next for key "${key}":`,
                    error
                );
            }
        }

        if (key in fallbackTexts) {
            let text = fallbackTexts[key as FallbackTextKeys];
            if (options && typeof options === 'object') {
                Object.keys(options).forEach((optionKey) => {
                    if (Object.prototype.hasOwnProperty.call(options, optionKey)) {
                        const optionValue = options[optionKey as keyof TOptions];
                        if (
                            typeof optionValue === 'string' ||
                            typeof optionValue === 'number'
                        ) {
                            text = text.replace(
                                new RegExp(`{{${optionKey}}}`, 'g'),
                                String(optionValue)
                            );
                        }
                    }
                });
            }
            return text;
        }
        return key;
    };
};