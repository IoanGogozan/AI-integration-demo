export const localizationConfig = {
  currentLocale: 'en',
  fallbackLocale: 'en',
  plannedDefaultLocale: 'nb',
  supportedLocales: [
    { code: 'en', label: 'English', status: 'active' },
    { code: 'nb', label: 'Norwegian Bokmal', status: 'planned_default' }
  ]
};

export function getLocalizationSummary() {
  return `Current UI language: English. Planned default after MVP stabilization: Norwegian Bokmal.`;
}
