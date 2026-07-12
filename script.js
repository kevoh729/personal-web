/* =============================================================================
   KNOWLEDGE BASE APPLICATION
   Main application logic for rendering entries, handling navigation, and modal
   ============================================================================= */

// Global state
let allEntries = [];
let currentSection = 'all';
const STORAGE_KEY = 'kb_entries';

/* =============================================================================
   INITIALIZATION
   ============================================================================= */

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load entries from browser storage first so admin changes are reflected
        await loadEntries();
        
        // Build dynamic navigation
        buildNavigation();
        
        // Render initial entries based on current page
        determineCurrentSection();
        renderEntries();
        
        // Set up event listeners
        setupEventListeners();
        window.addEventListener('storage', handleStorageUpdate);
    } catch (error) {
        console.error('Failed to initialize application:', error);
        displayErrorMessage('Failed to load entries. Please refresh the page.');
    }
});

/* =============================================================================
   DATA LOADING
   ============================================================================= */

/**
 * Load entries from browser storage first, then fall back to entries.json.
 * This ensures admin changes are reflected on the public pages.
 */
async function loadEntries() {
    try {
        const storedEntries = loadEntriesFromStorage();
        if (storedEntries !== null) {
            allEntries = storedEntries;
            allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            return;
        }

        const response = await fetch('entries.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allEntries = data.entries || [];
        
        // Sort entries by date in reverse chronological order (newest first)
        allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error loading entries:', error);
        throw error;
    }
}

/**
 * Retrieve entries from browser storage if present.
 * @returns {Array|null} Parsed entries or null if no stored data exists
 */
function loadEntriesFromStorage() {
    try {
        const storedValue = localStorage.getItem(STORAGE_KEY);
        if (storedValue === null) {
            return null;
        }

        const parsedValue = JSON.parse(storedValue);
        if (Array.isArray(parsedValue)) {
            return parsedValue;
        }

        if (parsedValue && Array.isArray(parsedValue.entries)) {
            return parsedValue.entries;
        }

        return [];
    } catch (error) {
        console.error('Error reading stored entries:', error);
        return null;
    }
}

/**
 * Refresh the page content when storage changes in another tab.
 */
async function handleStorageUpdate() {
    try {
        await loadEntries();
        buildNavigation();
        determineCurrentSection();
        renderEntries();
    } catch (error) {
        console.error('Failed to refresh entries after storage update:', error);
    }
}

/* =============================================================================
   SECTION & NAVIGATION HANDLING
   ============================================================================= */

/**
 * Determine which section/page the user is currently viewing
 */
function determineCurrentSection() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        currentSection = 'all';
    } else if (currentPage === 'engineering.html') {
        currentSection = 'Engineering';
    } else if (currentPage === 'finance.html') {
        currentSection = 'Finance';
    } else if (currentPage === 'business.html') {
        currentSection = 'Business';
    } else if (currentPage === 'inspiration.html') {
        currentSection = 'Inspiration';
    }
}

/**
 * Get all unique sections from entries
 * @returns {Array<string>} Array of unique section names
 */
function getUniqueSections() {
    const sections = new Set();
    allEntries.forEach(entry => {
        sections.add(entry.section);
    });
    return Array.from(sections).sort();
}

/**
 * Build dynamic navigation links based on entries
 */
function buildNavigation() {
    const navLinks = document.getElementById('navLinks');
    navLinks.innerHTML = '<li><a href="index.html" class="nav-link" data-section="all">All</a></li>';
    
    const sections = getUniqueSections();
    sections.forEach(section => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `${section.toLowerCase()}.html`;
        link.className = 'nav-link';
        link.textContent = section;
        link.dataset.section = section;
        li.appendChild(link);
        navLinks.appendChild(li);
    });
    
    // Update active link
    updateActiveNavLink();
}

/**
 * Update the active navigation link based on current section
 */
function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (currentSection === 'all' && link.dataset.section === 'all') {
            link.classList.add('active');
        } else if (link.dataset.section === currentSection) {
            link.classList.add('active');
        }
    });
}

/* =============================================================================
   ENTRIES FILTERING & RENDERING
   ============================================================================= */

/**
 * Filter entries by section
 * @param {string} section - Section name ('all' for all sections)
 * @returns {Array} Filtered entries
 */
function filterEntriesBySection(section) {
    if (section === 'all') {
        return allEntries;
    }
    return allEntries.filter(entry => entry.section === section);
}

/**
 * Render entries to the grid
 */
function renderEntries() {
    const entriesGrid = document.getElementById('entriesGrid');
    const filteredEntries = filterEntriesBySection(currentSection);
    
    if (filteredEntries.length === 0) {
        entriesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">No entries found for this section.</div>';
        return;
    }
    
    entriesGrid.innerHTML = '';
    filteredEntries.forEach(entry => {
        const card = createEntryCard(entry);
        entriesGrid.appendChild(card);
    });
}

/**
 * Create an entry card element
 * @param {Object} entry - Entry data object
 * @returns {HTMLElement} Entry card element
 */
function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View ${entry.title}`);
    
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    const cardTitle = document.createElement('h2');
    cardTitle.className = 'card-title';
    cardTitle.textContent = entry.title;
    
    const cardMeta = document.createElement('div');
    cardMeta.className = 'card-meta';
    
    const sectionBadge = document.createElement('span');
    sectionBadge.className = 'card-section';
    sectionBadge.textContent = entry.section;
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'card-date';
    dateSpan.textContent = formatDate(entry.date);
    
    cardMeta.appendChild(sectionBadge);
    cardMeta.appendChild(dateSpan);
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardMeta);
    
    card.appendChild(cardHeader);
    
    // Add thumbnail if media exists
    if (entry.media_type && entry.media_url) {
        const thumbnail = createThumbnail(entry);
        card.appendChild(thumbnail);
    }
    
    // Add content snippet
    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';
    
    const snippet = document.createElement('div');
    snippet.className = 'card-snippet';
    snippet.innerHTML = extractTextSnippet(entry.content);
    
    contentDiv.appendChild(snippet);
    card.appendChild(contentDiv);
    
    // Add footer with action buttons
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    
    // Add link button if entry has external link
    if (entry.link_url) {
        const linkBtn = document.createElement('a');
        linkBtn.href = entry.link_url;
        linkBtn.target = '_blank';
        linkBtn.rel = 'noopener noreferrer';
        linkBtn.className = 'card-link';
        linkBtn.textContent = 'External Link';
        linkBtn.addEventListener('click', (e) => e.stopPropagation());
        footer.appendChild(linkBtn);
    }
    
    // Add read more button
    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = 'read-more-btn';
    readMoreBtn.textContent = 'Read More';
    readMoreBtn.addEventListener('click', () => openModal(entry));
    footer.appendChild(readMoreBtn);
    
    card.appendChild(footer);
    
    // Open modal on card click or Enter key
    card.addEventListener('click', () => openModal(entry));
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            openModal(entry);
        }
    });
    
    return card;
}

/**
 * Create thumbnail element based on media type
 * @param {Object} entry - Entry data object
 * @returns {HTMLElement} Thumbnail element
 */
function createThumbnail(entry) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'card-thumbnail';
    
    if (entry.media_type === 'image' && entry.media_url) {
        const img = document.createElement('img');
        img.src = entry.media_url;
        img.alt = entry.title;
        img.loading = 'lazy';
        thumbnail.appendChild(img);
    } else if (entry.media_type === 'video' && entry.media_url) {
        const video = document.createElement('video');
        video.src = entry.media_url;
        video.controls = true;
        video.preload = 'metadata';
        thumbnail.appendChild(video);
    } else if (entry.media_type === 'link') {
        thumbnail.className += ' placeholder';
        thumbnail.textContent = 'External Link Available';
    }
    
    return thumbnail;
}

/**
 * Extract text snippet from HTML content
 * @param {string} htmlContent - HTML content string
 * @returns {string} Plain text snippet (up to 150 characters)
 */
function extractTextSnippet(htmlContent) {
    // Create temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    
    // Get all text content
    let text = temp.textContent || temp.innerText || '';
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit to 150 characters
    if (text.length > 150) {
        text = text.substring(0, 150) + '...';
    }
    
    return text;
}

/**
 * Format date string to readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', options);
}

/* =============================================================================
   MODAL HANDLING
   ============================================================================= */

/**
 * Open entry detail modal
 * @param {Object} entry - Entry data object
 */
function openModal(entry) {
    const modal = document.getElementById('entryModal');
    const overlay = document.getElementById('modalOverlay');
    const detailDiv = document.getElementById('entryDetail');
    
    // Build detail content
    detailDiv.innerHTML = createDetailContent(entry);
    
    // Show modal
    modal.classList.add('active');
    overlay.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus on modal close button for accessibility
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.focus();
}

/**
 * Close entry detail modal
 */
function closeModal() {
    const modal = document.getElementById('entryModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

/**
 * Create detail view HTML content
 * @param {Object} entry - Entry data object
 * @returns {string} HTML string
 */
function createDetailContent(entry) {
    let html = '<div class="entry-detail-wrapper">';
    
    // Header
    html += '<div class="detail-header">';
    html += `<h1 class="detail-title">${escapeHtml(entry.title)}</h1>`;
    html += '<div class="detail-meta">';
    html += `<span class="detail-section">${escapeHtml(entry.section)}</span>`;
    html += `<span class="detail-date">${formatDate(entry.date)}</span>`;
    html += '</div>';
    html += '</div>';
    
    // Media
    if (entry.media_type && entry.media_url) {
        html += createMediaElement(entry);
    }
    
    // Content
    html += '<div class="detail-content">';
    html += entry.content;
    html += '</div>';
    
    // Link
    if (entry.link_url) {
        html += `<a href="${escapeHtml(entry.link_url)}" target="_blank" rel="noopener noreferrer" class="detail-link">Visit Source</a>`;
    }
    
    html += '</div>';
    return html;
}

/**
 * Create media element based on media type
 * @param {Object} entry - Entry data object
 * @returns {string} HTML string
 */
function createMediaElement(entry) {
    let html = '<div class="detail-media">';
    
    if (entry.media_type === 'image') {
        html += `<img src="${escapeHtml(entry.media_url)}" alt="${escapeHtml(entry.title)}" loading="lazy">`;
    } else if (entry.media_type === 'video') {
        // Detect if it's a YouTube/Vimeo embed
        if (entry.media_url.includes('youtube.com') || entry.media_url.includes('youtu.be')) {
            const videoId = extractYouTubeId(entry.media_url);
            html += `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
        } else if (entry.media_url.includes('vimeo.com')) {
            const videoId = extractVimeoId(entry.media_url);
            html += `<iframe src="https://player.vimeo.com/video/${videoId}" allowfullscreen></iframe>`;
        } else {
            // Standard video file
            html += `<video controls style="width: 100%; height: auto;"><source src="${escapeHtml(entry.media_url)}"></video>`;
        }
    }
    
    html += '</div>';
    return html;
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string} Video ID
 */
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

/**
 * Extract Vimeo video ID from URL
 * @param {string} url - Vimeo URL
 * @returns {string} Video ID
 */
function extractVimeoId(url) {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/* =============================================================================
   ERROR HANDLING
   ============================================================================= */

/**
 * Display error message to user
 * @param {string} message - Error message
 */
function displayErrorMessage(message) {
    const entriesGrid = document.getElementById('entriesGrid');
    entriesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">${escapeHtml(message)}</div>`;
}

/* =============================================================================
   EVENT LISTENERS
   ============================================================================= */

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Modal close button
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Modal overlay click
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    // Keyboard navigation (Escape to close modal)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('entryModal');
            if (modal.classList.contains('active')) {
                closeModal();
            }
        }
    });
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Let the link navigate naturally
            // The page will reload and determineCurrentSection() will run
        });
    });
}
