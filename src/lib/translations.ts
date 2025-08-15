import enMessages from '../../messages/en.json';
import zhMessages from '../../messages/zh.json';

export type Locale = 'en' | 'zh';

const messages = {
  en: enMessages,
  zh: zhMessages
} as const;

export function getTranslations(locale: Locale) {
  return {
    t: (key: string): string => {
      const keys = key.split('.');
      let value: any = messages[locale];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    }
  };
}