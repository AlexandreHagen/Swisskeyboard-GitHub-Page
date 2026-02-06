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
        const normalizedUrlLang = normalizeLanguage(urlLang);
        if (normalizedUrlLang) {
            localStorage.setItem(STORAGE_KEY, normalizedUrlLang);
            return normalizedUrlLang;
        }

        // 2. Check localStorage
        const storedLang = localStorage.getItem(STORAGE_KEY);
        const normalizedStoredLang = normalizeLanguage(storedLang);
        if (normalizedStoredLang) {
            return normalizedStoredLang;
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
        const browserLangs = Array.isArray(navigator.languages) && navigator.languages.length
            ? navigator.languages
            : [navigator.language || navigator.userLanguage].filter(Boolean);

        for (const lang of browserLangs) {
            const normalized = normalizeLanguage(lang);
            if (normalized) {
                return normalized;
            }
        }

        return null;
    }

    /**
     * Normalize language tags to supported languages
     * Examples: "fr-CH" -> "fr", "de_CH" -> "de"
     */
    function normalizeLanguage(lang) {
        if (!lang || typeof lang !== 'string') return null;
        const normalized = lang.replace('_', '-').toLowerCase().trim();
        if (!normalized) return null;

        // Exact match (already supported)
        if (SUPPORTED_LANGUAGES.includes(normalized)) {
            return normalized;
        }

        // Regional variants -> base language
        const base = normalized.split('-')[0];
        if (SUPPORTED_LANGUAGES.includes(base)) {
            return base;
        }

        // Common Swiss/local variants mapping
        const map = {
            'de-ch': 'de',
            'de-at': 'de',
            'de-de': 'de',
            'fr-ch': 'fr',
            'fr-fr': 'fr',
            'fr-ca': 'fr',
            'it-ch': 'it',
            'it-it': 'it',
            'rm-ch': 'rm',
            'en-ch': 'en',
            'en-us': 'en',
            'en-gb': 'en'
        };

        return map[normalized] || null;
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

        // Update meta tags for SEO
        updateMetaTags(lang);

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

        // Update meta tags for SEO
        updateMetaTags(currentLanguage);
    }

    /**
     * Update meta tags (description, OG, Twitter, canonical) for current language
     */
    function updateMetaTags(lang) {
        const meta = translations[lang]?.meta;
        if (!meta) return;

        const title = meta.title || '';
        const description = meta.description || '';

        const localeMap = {
            'de': 'de_CH',
            'fr': 'fr_CH',
            'it': 'it_CH',
            'rm': 'rm_CH',
            'en': 'en_GB'
        };

        // Meta description
        const metaDesc = document.getElementById('meta-description');
        if (metaDesc) metaDesc.setAttribute('content', description);

        // Canonical URL
        const canonical = document.getElementById('canonical-url');
        if (canonical) {
            canonical.setAttribute('href', lang === DEFAULT_LANGUAGE
                ? 'https://swisskeyboard.ch/'
                : `https://swisskeyboard.ch/?lang=${lang}`);
        }

        // Open Graph
        const ogTitle = document.getElementById('og-title');
        if (ogTitle) ogTitle.setAttribute('content', title);

        const ogDesc = document.getElementById('og-description');
        if (ogDesc) ogDesc.setAttribute('content', description);

        const ogUrl = document.getElementById('og-url');
        if (ogUrl) {
            ogUrl.setAttribute('content', lang === DEFAULT_LANGUAGE
                ? 'https://swisskeyboard.ch/'
                : `https://swisskeyboard.ch/?lang=${lang}`);
        }

        const ogLocale = document.getElementById('og-locale');
        if (ogLocale) ogLocale.setAttribute('content', localeMap[lang] || 'de_CH');

        // Twitter Card
        const twitterTitle = document.getElementById('twitter-title');
        if (twitterTitle) twitterTitle.setAttribute('content', title);

        const twitterDesc = document.getElementById('twitter-description');
        if (twitterDesc) twitterDesc.setAttribute('content', description);
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
            <button class="lang-current" id="lang-current" aria-expanded="false" aria-haspopup="listbox" aria-label="Language: ${languageFullNames[currentLanguage]}">
                <span class="lang-code">${languageFullNames[currentLanguage]}</span>
                <svg class="lang-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <div class="lang-dropdown" id="lang-dropdown" role="listbox" aria-label="Select language">
                ${SUPPORTED_LANGUAGES.map(lang => `
                    <button class="lang-option ${lang === currentLanguage ? 'active' : ''}" data-lang="${lang}" role="option" aria-selected="${lang === currentLanguage}">
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
            const isOpen = switcher.classList.contains('open');
            current.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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
            current.setAttribute('aria-expanded', 'false');
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
                const isActive = lang === currentLanguage;
                option.classList.toggle('active', isActive);
                option.setAttribute('aria-selected', isActive ? 'true' : 'false');
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
