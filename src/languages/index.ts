import en from './en.json';
import ta from './ta.json';
import hi from './hi.json';

export type LanguageCode = 'en' | 'ta' | 'hi';

export const languages = {
  en: { name: 'English', nativeName: 'English' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  hi: { name: 'Hindi', nativeName: 'हिंदी' },
};

const translations: Record<LanguageCode, typeof en> = {
  en,
  ta,
  hi,
};

/**
 * Get translated text
 * @param language Current language code
 * @param key Dot-separated key path (e.g., 'home.hello')
 * @param fallback Fallback text if key not found
 * @returns Translated text
 */
export const t = (
  language: LanguageCode,
  key: string,
  fallback: string = key
): string => {
  try {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (!value) {
        // Fallback to English if translation not found
        value = translations.en;
        for (const ek of keys) {
          value = value?.[ek];
        }
        return value || fallback;
      }
    }

    return value || fallback;
  } catch (error) {
    console.warn(`Translation key not found: ${key}`);
    return fallback;
  }
};

export default translations;
