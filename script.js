// Canton data with suggestions
const CANTONS = {
    "ZH": {
        name: "Zürich",
        path: "M 600,200 L 650,190 L 680,210 L 670,250 L 630,260 L 590,240 Z",
        center: [630, 225],
        suggestions: [
            { words: ["Ich", "gang", "go"], options: [["Ich", "I", "Ig"], ["gang", "gange", "gah"], ["poschte", "schaffe", "chrömle"]] }
        ]
    },
    "BE": {
        name: "Bern",
        path: "M 450,250 L 550,240 L 580,300 L 570,380 L 500,400 L 420,390 L 400,340 L 410,280 Z",
        center: [490, 320],
        suggestions: [
            { words: ["Das", "isch", "gäng"], options: [["Das", "Ds", "S'"], ["isch", "esch", "sy"], ["gäng", "immer", "allpott"]] }
        ]
    },
    "LU": {
        name: "Luzern",
        path: "M 580,280 L 620,275 L 640,300 L 630,330 L 600,340 L 570,320 Z",
        center: [605, 305],
        suggestions: [
            { words: ["Es", "hät", "es"], options: [["Es", "S'", "Das"], ["hät", "het", "hed"], ["Chrüsimüsi", "Problem", "Gschänkli"]] }
        ]
    },
    "BS": {
        name: "Basel-Stadt",
        path: "M 470,180 L 490,178 L 495,195 L 485,200 L 470,195 Z",
        center: [482, 189],
        suggestions: [
            { words: ["Salü", "wie", "gohts"], options: [["Salü", "Sali", "Hoi"], ["wie", "wi", "was"], ["gohts", "goht's", "laufts"]] }
        ]
    },
    "SG": {
        name: "St. Gallen",
        path: "M 680,230 L 740,220 L 770,260 L 760,310 L 710,320 L 670,300 L 665,270 Z",
        center: [717, 270],
        suggestions: [
            { words: ["Auf", "Wieder"], options: [["Auf", "Uf", "Off"], ["Wiederloge", "Wiedersehe", "Widerluege"]] }
        ]
    },
    "GR": {
        name: "Graubünden",
        path: "M 750,320 L 850,310 L 880,400 L 860,480 L 790,490 L 740,460 L 730,390 Z",
        center: [805, 400],
        suggestions: [
            { words: ["Mir", "gönd", "a"], options: [["Mir", "Mer", "Nus"], ["gönd", "gian", "gömmer"], ["d'Chilbi", "d'Alp", "Chur"]] }
        ]
    },
    "VS": {
        name: "Valais",
        path: "M 400,400 L 500,395 L 550,420 L 540,470 L 480,485 L 400,475 L 380,440 L 385,410 Z",
        center: [465, 440],
        suggestions: [
            { words: ["Gang", "ds"], options: [["Gang", "Gah", "Gönd"], ["Pfeischter", "Fänschter", "Türe"]] }
        ]
    },
    "TI": {
        name: "Ticino",
        path: "M 680,400 L 730,395 L 750,480 L 720,520 L 670,510 L 655,450 L 660,420 Z",
        center: [702, 460],
        suggestions: [
            { words: ["Ciao", "come"], options: [["Ciao", "Salü", "Hoi"], ["come", "wie", "was"], ["stai", "va", "bene"]] }
        ]
    },
    "VD": {
        name: "Vaud",
        path: "M 280,320 L 360,310 L 380,380 L 360,440 L 300,450 L 270,420 L 260,360 Z",
        center: [320, 380],
        suggestions: [
            { words: ["Salut", "ça"], options: [["Salut", "Bonjour", "Coucou"], ["ça", "comment", "quoi"], ["va", "roule", "joue"]] }
        ]
    },
    "AG": {
        name: "Aargau",
        path: "M 520,210 L 570,205 L 590,240 L 570,270 L 530,265 L 510,235 Z",
        center: [550, 237],
        suggestions: [
            { words: ["Häsch", "scho"], options: [["Häsch", "Hesch", "Händ"], ["Znüni", "Zmittag", "Znacht"]] }
        ]
    },
    "UR": {
        name: "Uri",
        path: "M 620,340 L 650,350 L 660,380 L 645,400 L 615,395 L 605,370 Z",
        center: [635, 370],
        suggestions: [
            { words: ["Grüezi", "mitenand"], options: [["Grüezi", "Sali", "Hoi"], ["mitenand", "zäme", "äso"]] }
        ]
    },
    "SZ": {
        name: "Schwyz",
        path: "M 640,310 L 670,305 L 685,330 L 675,355 L 645,360 L 630,335 Z",
        center: [660, 330],
        suggestions: [
            { words: ["Hoi", "zäme"], options: [["Hoi", "Grüezi", "Sali"], ["zäme", "mitenand", "äso"]] }
        ]
    },
    "OW": {
        name: "Obwalden",
        path: "M 585,330 L 610,325 L 620,345 L 605,360 L 585,355 Z",
        center: [600, 343],
        suggestions: [
            { words: ["Mir", "händ"], options: [["Mir", "Mer", "Üs"], ["händ", "hei", "gönd"]] }
        ]
    },
    "NW": {
        name: "Nidwalden",
        path: "M 610,310 L 630,305 L 635,325 L 620,335 L 610,325 Z",
        center: [618, 320],
        suggestions: [
            { words: ["Das", "isch"], options: [["Das", "S'", "Ds"], ["isch", "esch", "hed"]] }
        ]
    },
    "ZG": {
        name: "Zug",
        path: "M 590,260 L 610,255 L 615,270 L 605,280 L 590,275 Z",
        center: [602, 268],
        suggestions: [
            { words: ["Mir", "gönd"], options: [["Mir", "Mer", "Üs"], ["gönd", "gömmer", "hei"]] }
        ]
    }
};

let currentCanton = null;
let isAnimating = false;
let autoPlayInterval = null;

// Initialize map
function initMap() {
    const svg = document.getElementById('swissMap');
    if (!svg) {
        return false;
    }

    // Add simplified cantons
    Object.entries(CANTONS).forEach(([code, canton]) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('canton');
        g.dataset.cantonCode = code;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', canton.path);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.classList.add('canton-label');
        text.setAttribute('x', canton.center[0]);
        text.setAttribute('y', canton.center[1]);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = code;

        g.appendChild(path);
        g.appendChild(text);
        svg.appendChild(g);

        g.addEventListener('click', () => selectCanton(code));
    });

    return true;
}

// Select canton
function selectCanton(code) {
    if (isAnimating) return;

    const canton = CANTONS[code];
    currentCanton = code;

    // Update active state
    document.querySelectorAll('.canton').forEach(el => {
        el.classList.remove('active');
    });
    const activeCanton = document.querySelector(`[data-canton-code="${code}"]`);
    if (!activeCanton) return;
    activeCanton.classList.add('active');

    // Run animation
    const suggestion = canton.suggestions[0];
    animateAutocomplete(suggestion);
}

// Type text animation
async function typeText(text, speed = 100) {
    const element = document.getElementById('typedText');
    element.textContent = '';

    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await sleep(speed);
    }
}

// Show suggestions
function showSuggestions(suggestions) {
    const bar = document.getElementById('autocompleteBar');
    bar.replaceChildren();

    suggestions.forEach((word, index) => {
        const pill = document.createElement('div');
        pill.className = 'suggestion-pill';
        if (index === 1) pill.classList.add('center');
        pill.textContent = word;
        pill.style.animationDelay = `${index * 25}ms`;
        bar.appendChild(pill);
    });

    bar.classList.add('show');
}

// Animate autocomplete
async function animateAutocomplete(suggestion) {
    if (isAnimating) return;
    isAnimating = true;

    const typedText = document.getElementById('typedText');
    const bar = document.getElementById('autocompleteBar');

    // Reset
    typedText.textContent = '';
    bar.classList.remove('show');
    bar.replaceChildren();

    let fullText = '';

    for (let i = 0; i < suggestion.words.length; i++) {
        await typeText(fullText + suggestion.words[i], 30);
        await sleep(100);

        if (suggestion.options[i]) {
            showSuggestions(suggestion.options[i]);
            await sleep(500);

            // Accept middle suggestion
            fullText += suggestion.options[i][1] + ' ';
            typedText.textContent = fullText;

            bar.classList.remove('show');
            await sleep(150);
        }
    }

    await sleep(500);
    isAnimating = false;
}

// Sleep utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-play
function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
        if (!isAnimating) {
            const codes = Object.keys(CANTONS);
            const randomCode = codes[Math.floor(Math.random() * codes.length)];
            selectCanton(randomCode);
        }
    }, 2000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
}

function initNewsletterForm() {
    const forms = document.querySelectorAll('.newsletter-form');
    if (!forms.length) return;

    forms.forEach(form => {
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailInput) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!emailInput.checkValidity()) {
                emailInput.reportValidity();
                return;
            }

            const email = emailInput.value.trim();
            const t = window.i18n && typeof window.i18n.t === 'function'
                ? window.i18n.t
                : null;
            const subjectTemplate = t ? t('cta.emailSubject', 'Beta program signup') : 'Beta program signup';
            const bodyTemplate = t
                ? t('cta.emailBody', 'Hello,\nI would like to sign up for the beta program.\nEmail: {email}')
                : 'Hello,\nI would like to sign up for the beta program.\nEmail: {email}';
            const bodyWithEmail = bodyTemplate.replace('{email}', email);
            const subjectWithEnglish = `${subjectTemplate} (Beta program signup)`;
            const subject = encodeURIComponent(subjectWithEnglish);
            const body = encodeURIComponent(bodyWithEmail);
            window.location.href = `mailto:contact@swisskeyboard.ch?subject=${subject}&body=${body}`;
        });
    });
}

// Initialize immediately when script loads (components are already loaded)
function init() {
    const hasMap = initMap();
    initNewsletterForm();

    // Initialize hero video renderer
    // To use: call initHeroVideoRenderer('path/to/your/video.mp4') when video is ready
    // Example:
    // setTimeout(() => {
    //     if (typeof initHeroVideoRenderer === 'function') {
    //         initHeroVideoRenderer('videos/hero-video.mp4');
    //     }
    // }, 1000);

    if (hasMap) {
        // Start with Zürich after delay
        setTimeout(() => {
            selectCanton('ZH');
            startAutoPlay();
        }, 750);
    }
}

// Check if DOM is already loaded or wait for it
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
