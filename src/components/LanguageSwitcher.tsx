'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Get the pathname without the current locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleLanguageChange('zh')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'zh'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
        }`}
      >
        English
      </button>
    </div>
  );
}