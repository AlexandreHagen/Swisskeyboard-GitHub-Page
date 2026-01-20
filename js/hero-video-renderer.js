/**
 * Hero Video Character Renderer
 * Renders MP4 video frames as character art using Swiss German characters
 */

class HeroVideoRenderer {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.display = null;
        this.isPlaying = false;
        this.animationFrame = null;
        
        // Swiss German character set - ordered by visual density
        // Denser characters for darker areas, lighter for brighter areas
        // Characters are weighted to favor Swiss German-specific characters
        this.swissGermanChars = [
            // Lightest (bright areas) - sparse
            ' ', ' ', '.', '·', '·',
            // Light - thin characters
            'i', 'l', '|', ':', ';', 'j', 't',
            // Medium-light - common vowels
            'a', 'e', 'o', 'u', 'c', 'n', 'r', 's', 'v', 'x', 'z',
            // Medium - Swiss German umlauts and common consonants
            'ä', 'ö', 'ü', 'h', 'k', 'm', 'w', 'y', 'f',
            // Medium-dark - denser consonants
            'b', 'd', 'g', 'p', 'q', 'ß',
            // Dark - uppercase common
            'B', 'D', 'E', 'F', 'H', 'K', 'L', 'N', 'P', 'R', 'T',
            // Darker - uppercase umlauts and dense
            'A', 'O', 'U', 'Ä', 'Ö', 'Ü', 'G', 'M', 'W',
            // Very dark - heavy characters
            'Q', 'S', 'V', 'X', 'Z', 'C',
            // Darkest - special characters and digraphs
            '@', '#', '%', '&', '*', 'CH', 'SCH', 'CH', 'SCH'
        ];
        
        // Character mapping based on brightness
        this.charMap = this.createCharMap();
        
        // Rendering settings
        this.settings = {
            charWidth: 8,      // Character width in pixels
            charHeight: 12,    // Character height in pixels
            contrast: 1.2,     // Contrast multiplier
            brightness: 0.0,   // Brightness adjustment
            invert: false      // Invert colors
        };
    }

    /**
     * Validate and normalize a video source.
     * Allows same-origin URLs, relative paths, blob:, and video/* data URIs.
     */
    sanitizeVideoSrc(src) {
        if (typeof src !== 'string') return null;
        const trimmed = src.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('blob:')) return trimmed;
        if (trimmed.startsWith('data:')) {
            return /^data:video\//i.test(trimmed) ? trimmed : null;
        }
        try {
            const url = new URL(trimmed, window.location.href);
            if (url.origin !== window.location.origin) return null;
            return url.href;
        } catch {
            return null;
        }
    }
    
    /**
     * Create character map based on brightness levels
     */
    createCharMap() {
        const levels = 256;
        const map = new Array(levels);
        
        for (let i = 0; i < levels; i++) {
            const normalized = i / 255;
            // Use non-linear mapping for better visual effect
            const mapped = Math.pow(normalized, 0.7);
            const charIndex = Math.floor(mapped * (this.swissGermanChars.length - 1));
            map[i] = this.swissGermanChars[charIndex];
        }
        
        return map;
    }
    
    /**
     * Initialize the renderer
     */
    init(videoPath, options = {}) {
        this.video = document.getElementById('hero-video-source');
        this.canvas = document.getElementById('hero-video-canvas');
        this.display = document.getElementById('hero-character-display');
        
        if (!this.video || !this.canvas || !this.display) {
            console.error('Hero video renderer: Required elements not found');
            return;
        }
        
        // Set video source
        if (videoPath) {
            const safeVideoPath = this.sanitizeVideoSrc(videoPath);
            if (!safeVideoPath) {
                console.warn('Hero video renderer: blocked unsafe video path');
                return;
            }
            // Handle both blob URLs and regular paths
            if (safeVideoPath.startsWith('blob:') || safeVideoPath.startsWith('data:')) {
                // For blob/data URLs, set directly on video element
                this.video.src = safeVideoPath;
            } else {
                // For regular paths, use source element
                const source = document.getElementById('hero-video-src');
                if (source) {
                    source.src = safeVideoPath;
                } else {
                    this.video.src = safeVideoPath;
                }
            }
            this.video.load();
        }
        
        // Apply options
        if (options.autoPlay !== false) {
            this.video.autoplay = true;
        }
        if (options.muted !== false) {
            this.video.muted = true;
        }
        if (options.loop !== false) {
            this.video.loop = true;
        }
        
        // Setup canvas
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Wait for video to be ready
        this.video.addEventListener('loadedmetadata', () => {
            this.setupCanvas();
            this.render();
            
            // Auto-play if enabled
            if (options.autoPlay !== false) {
                this.video.play().catch(err => {
                    console.warn('Auto-play prevented:', err);
                });
            }
        });
        
        // Handle video ended
        this.video.addEventListener('ended', () => {
            if (this.video.loop) {
                this.video.currentTime = 0;
            }
        });
    }
    
    /**
     * Setup canvas dimensions based on video and display size
     */
    setupCanvas() {
        const displayRect = this.display.getBoundingClientRect();
        const videoAspect = this.video.videoWidth / this.video.videoHeight;
        
        // Calculate dimensions based on character size
        const cols = Math.floor(displayRect.width / this.settings.charWidth);
        const rows = Math.floor(displayRect.height / this.settings.charHeight);
        
        // Maintain aspect ratio
        const targetAspect = cols / rows;
        let finalCols = cols;
        let finalRows = rows;
        
        if (videoAspect > targetAspect) {
            finalRows = Math.floor(finalCols / videoAspect);
        } else {
            finalCols = Math.floor(finalRows * videoAspect);
        }
        
        // Set canvas size (scaled for processing)
        this.canvas.width = finalCols;
        this.canvas.height = finalRows;
        
        // Update display grid
        this.display.style.gridTemplateColumns = `repeat(${finalCols}, ${this.settings.charWidth}px)`;
        this.display.style.gridTemplateRows = `repeat(${finalRows}, ${this.settings.charHeight}px)`;
        
        // Create character elements
        this.createCharacterGrid(finalCols, finalRows);
    }
    
    /**
     * Create the grid of character elements
     */
    createCharacterGrid(cols, rows) {
        this.display.replaceChildren();
        this.charElements = [];
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const charEl = document.createElement('span');
                charEl.className = 'char-cell';
                charEl.setAttribute('data-x', x);
                charEl.setAttribute('data-y', y);
                this.display.appendChild(charEl);
                this.charElements.push(charEl);
            }
        }
    }
    
    /**
     * Render a frame
     */
    render() {
        if (!this.video || this.video.readyState < 2) {
            this.animationFrame = requestAnimationFrame(() => this.render());
            return;
        }
        
        // Draw video frame to canvas
        this.ctx.drawImage(
            this.video,
            0, 0,
            this.canvas.width,
            this.canvas.height
        );
        
        // Get image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Convert to characters
        this.convertToCharacters(data, this.canvas.width, this.canvas.height);
        
        // Continue rendering
        this.animationFrame = requestAnimationFrame(() => this.render());
    }
    
    /**
     * Convert pixel data to characters
     */
    convertToCharacters(data, width, height) {
        const { contrast, brightness, invert } = this.settings;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // Calculate brightness (luminance)
                let gray = (0.299 * r + 0.587 * g + 0.114 * b);
                
                // Apply contrast and brightness
                gray = (gray - 128) * contrast + 128 + brightness;
                
                // Clamp to 0-255
                gray = Math.max(0, Math.min(255, gray));
                
                // Invert if needed
                if (invert) {
                    gray = 255 - gray;
                }
                
                // Get character
                const char = this.charMap[Math.floor(gray)];
                
                // Update character element
                const charIndex = y * width + x;
                if (this.charElements && this.charElements[charIndex]) {
                    this.charElements[charIndex].textContent = char;
                }
            }
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const playPauseBtn = document.getElementById('renderer-play-pause');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }
        
        // Handle video play/pause
        this.video.addEventListener('play', () => {
            this.isPlaying = true;
            if (playPauseBtn) {
                playPauseBtn.classList.add('playing');
            }
        });
        
        this.video.addEventListener('pause', () => {
            this.isPlaying = false;
            if (playPauseBtn) {
                playPauseBtn.classList.remove('playing');
            }
        });
    }
    
    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }
    
    /**
     * Update settings
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.video) {
            this.video.pause();
            this.video.src = '';
        }
    }
}

// Initialize renderer when DOM is ready
let heroRenderer = null;

function initHeroVideoRenderer(videoPath, options = {}) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeRenderer(videoPath, options);
        });
    } else {
        initializeRenderer(videoPath, options);
    }
}

function initializeRenderer(videoPath, options = {}) {
    // Wait a bit for the component to be loaded
    setTimeout(() => {
        if (!heroRenderer) {
            heroRenderer = new HeroVideoRenderer();
        }
        if (videoPath) {
            heroRenderer.init(videoPath, options);
        } else {
            console.warn('Hero video renderer: No video path provided');
        }
    }, 100);
}

// Auto-initialize if video path is set via data attribute
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('hero-video-renderer-container');
    if (container) {
        const videoPath = container.getAttribute('data-video-path');
        if (videoPath) {
            initHeroVideoRenderer(videoPath);
        }
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeroVideoRenderer, initHeroVideoRenderer };
}
