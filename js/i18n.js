/**
 * SwissKeyboard i18n (Internationalization) System
 * Supports: German (de), French (fr), Italian (it), Romansh (rm), English (en)
 */

(function() {
    'use strict';

    const SUPPORTED_LANGUAGES = ['de', 'fr', 'it', 'rm', 'en'];
    const DEFAULT_LANGUAGE = 'de';
    const STORAGE_KEY = 'swisskeyboard_lang';
    
    let translations = {};
    let currentLanguage = DEFAULT_LANGUAGE;

    /**
     * Initialize the i18n system
     */
    async function init() {
        // Load translations
        try {
            const response = await fetch('js/translations.json');
            translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            return;
        }

        // Determine initial language
        currentLanguage = getInitialLanguage();
        
        // Apply translations
        applyTranslations();
        
        // Initialize language switcher
        initLanguageSwitcher();
        
        // Listen for language changes
        window.addEventListener('languagechange', () => {
            const browserLang = getBrowserLanguage();
            if (browserLang !== currentLanguage) {
                setLanguage(browserLang);
            }
        });
    }

    /**
     * Get the initial language from storage, URL, or browser
     */
    function getInitialLanguage() {
        // 1. Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
            localStorage.setItem(STORAGE_KEY, urlLang);
            return urlLang;
        }

        // 2. Check localStorage
        const storedLang = localStorage.getItem(STORAGE_KEY);
        if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
            return storedLang;
        }

        // 3. Check browser language
        const browserLang = getBrowserLanguage();
        if (browserLang) {
            return browserLang;
        }

        // 4. Default
        return DEFAULT_LANGUAGE;
    }

    /**
     * Get browser's preferred language
     */
    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const shortLang = browserLang.split('-')[0].toLowerCase();
        
        if (SUPPORTED_LANGUAGES.includes(shortLang)) {
            return shortLang;
        }
        
        return null;
    }

    /**
     * Set the current language and apply translations
     */
    function setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            console.warn(`Language "${lang}" not supported`);
            return;
        }

        currentLanguage = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Apply translations
        applyTranslations();
        
        // Update language switcher
        updateLanguageSwitcher();
        
        // Update page title
        if (translations[lang]?.meta?.title) {
            document.title = translations[lang].meta.title;
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('i18n:languageChanged', { detail: { language: lang } }));
    }

    /**
     * Get a translation by key path (e.g., "hero.title")
     */
    function t(keyPath, fallback = '') {
        const keys = keyPath.split('.');
        let value = translations[currentLanguage];
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                // Try fallback to default language
                value = translations[DEFAULT_LANGUAGE];
                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) {
                        value = value[k];
                    } else {
                        return fallback || keyPath;
                    }
                }
                break;
            }
        }
        
        return typeof value === 'string' ? value : (fallback || keyPath);
    }

    /**
     * Apply translations to all elements with data-i18n attributes
     */
    function applyTranslations() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = t(key);
            
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = t(key);
            
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Update elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = t(key);
            
            if (translation) {
                element.title = translation;
            }
        });

        // Update page title
        if (translations[currentLanguage]?.meta?.title) {
            document.title = translations[currentLanguage].meta.title;
        }
    }

    /**
     * Initialize the language switcher UI
     */
    function initLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (!switcher) return;

        // Populate language options
        const languageNames = {
            'de': 'DE',
            'fr': 'FR',
            'it': 'IT',
            'rm': 'RM',
            'en': 'EN'
        };

        const languageFullNames = {
            'de': 'Deutsch',
            'fr': 'Français',
            'it': 'Italiano',
            'rm': 'Rumantsch',
            'en': 'English'
        };

        // Create dropdown content (no emojis, full language names)
        let dropdownHTML = `
            <div class="lang-current" id="lang-current">
                <span class="lang-code">${languageFullNames[currentLanguage]}</span>
                <svg class="lang-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="lang-dropdown" id="lang-dropdown">
                ${SUPPORTED_LANGUAGES.map(lang => `
                    <button class="lang-option ${lang === currentLanguage ? 'active' : ''}" data-lang="${lang}">
                        <span class="lang-name">${languageFullNames[lang]}</span>
                    </button>
                `).join('')}
            </div>
        `;

        switcher.innerHTML = dropdownHTML;

        // Toggle dropdown
        const current = document.getElementById('lang-current');
        const dropdown = document.getElementById('lang-dropdown');
        
        current.addEventListener('click', (e) => {
            e.stopPropagation();
            switcher.classList.toggle('open');
        });

        // Handle language selection
        dropdown.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                setLanguage(lang);
                switcher.classList.remove('open');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            switcher.classList.remove('open');
        });
    }

    /**
     * Update the language switcher to reflect current language
     */
    function updateLanguageSwitcher() {
        const languageFullNames = {
            'de': 'Deutsch',
            'fr': 'Français',
            'it': 'Italiano',
            'rm': 'Rumantsch',
            'en': 'English'
        };

        const current = document.getElementById('lang-current');
        if (current) {
            const code = current.querySelector('.lang-code');
            if (code) code.textContent = languageFullNames[currentLanguage];
        }

        const dropdown = document.getElementById('lang-dropdown');
        if (dropdown) {
            dropdown.querySelectorAll('.lang-option').forEach(option => {
                const lang = option.getAttribute('data-lang');
                option.classList.toggle('active', lang === currentLanguage);
            });
        }
    }

    /**
     * Get flag emoji for a language
     */
    function getLanguageFlag(lang) {
        const flags = {
            'de': '🇨🇭',
            'fr': '🇨🇭',
            'it': '🇨🇭',
            'rm': '🇨🇭',
            'en': '🇬🇧'
        };
        return flags[lang] || '🌐';
    }

    /**
     * Get current language
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Get all supported languages
     */
    function getSupportedLanguages() {
        return [...SUPPORTED_LANGUAGES];
    }

    // Expose API globally
    window.i18n = {
        init,
        t,
        setLanguage,
        getCurrentLanguage,
        getSupportedLanguages,
        applyTranslations
    };

    // Don't auto-initialize - wait for components to be loaded
    // The init() will be called manually after components are loaded
})();
