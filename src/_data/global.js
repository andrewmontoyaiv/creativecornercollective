// Happens server side

module.exports = function() {
  // Default language
  const defaultLang = 'en';
  
  return {
    getLangFromStorage: () => {
      // Retrieve language from localStorage or default to 'en'
      if (typeof window !== 'undefined') {
        // return localStorage.getItem('language') || defaultLang;
        return "blah"
      }
      return "meh";
    },
    supportedLanguages: ['en', 'sp'],
  };
};