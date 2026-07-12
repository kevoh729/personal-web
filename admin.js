/* =============================================================================
   ADMIN PANEL APPLICATION
   Complete admin functionality for managing knowledge base entries
   ============================================================================= */

// Global state
let allEntries = [];
let nextId = 1;
let deleteTargetId = null;
const STORAGE_KEY = 'kb_entries';

/* =============================================================================
   INITIALIZATION
   ============================================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeAdmin();
        setupEventListeners();
        renderOverview();
    } catch (error) {
        console.error('Failed to initialize admin:', error);
        showNotification('Failed to initialize admin panel', 'error');
    }
});

async function initializeAdmin() {
    // Try to load from entries.json first, then fall back to localStorage
    try {
        const response = await fetch('entries.json');
        if (response.ok) {
            const data = await response.json();
            allEntries = data.entries || [];
            saveToLocalStorage();
        }
    } catch (e) {
        // entries.json might not exist or there's a CORS issue
        const stored = loadFromLocalStorage();
        if (stored.length > 0) {
            allEntries = stored;
        }
    }

    // Calculate next ID
    if (allEntries.length > 0) {
        nextId = Math.max(...allEntries.map(e => e.id)) + 1;
    }

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entryDate').valueAsDate = new Date(today + 'T00:00:00');
}

/* =============================================================================
   LOCALSTORAGE MANAGEMENT
   ============================================================================= */

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allEntries));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return [];
    }
}

/* =============================================================================
   PANEL NAVIGATION
   ============================================================================= */

function setupEventListeners() {
    // Panel navigation
    document.querySelectorAll('.admin-menu-item').forEach(btn => {
        btn.addEventListener('click', (e) => switchPanel(e.target.dataset.panel));
    });

    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Add entry form
    document.getElementById('addEntryForm').addEventListener('submit', handleAddEntry);

    // Media type change
    document.getElementById('mediaType').addEventListener('change', handleMediaTypeChange);

    // Manage entries
    document.getElementById('searchEntries').addEventListener('input', filterEntries);
    document.getElementById('filterSection').addEventListener('change', filterEntries);

    // Import/Export
    document.getElementById('exportBtn').addEventListener('click', exportEntries);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', handleImportFile);

    // Delete modal
    document.getElementById('deleteModalClose').addEventListener('click', closeDeleteModal);
    document.getElementById('deleteOverlay').addEventListener('click', closeDeleteModal);
    document.getElementById('deleteCancel').addEventListener('click', closeDeleteModal);
    document.getElementById('deleteConfirm').addEventListener('click', confirmDelete);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDeleteModal();
    });
}

function switchPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Remove active class from menu items
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected panel
    const panelId = `${panelName}-panel`;
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active');
    }

    // Mark menu item as active
    document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');

    // Render panel-specific content
    if (panelName === 'overview') {
        renderOverview();
    } else if (panelName === 'manage') {
        renderManagePanel();
    } else if (panelName === 'import-export') {
        updateFilterSections();
    }
}

/* =============================================================================
   OVERVIEW PANEL
   ============================================================================= */

function renderOverview() {
    // Update stats
    document.getElementById('totalEntries').textContent = allEntries.length;
    document.getElementById('totalSections').textContent = getUniqueSections().length;

    // Count entries from this month
    const now = new Date();
    const thisMonth = allEntries.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    document.getElementById('recentEntries').textContent = thisMonth;

    // Show recent entries
    const recent = [...allEntries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const recentList = document.getElementById('recentList');
    if (recent.length === 0) {
        recentList.innerHTML = '<div class="empty-state">No entries yet. Create your first entry to get started.</div>';
        return;
    }

    recentList.innerHTML = recent.map(entry => `
        <div class="entry-item">
            <div class="entry-item-title">${escapeHtml(entry.title)}</div>
            <div class="entry-item-meta">
                <span class="entry-item-section">${escapeHtml(entry.section)}</span>
                <span class="entry-item-date">${formatDate(entry.date)}</span>
            </div>
        </div>
    `).join('');
}

/* =============================================================================
   ADD ENTRY FUNCTIONALITY
   ============================================================================= */

function handleMediaTypeChange(e) {
    const mediaType = e.target.value;
    const mediaUrlGroup = document.getElementById('mediaUrlGroup');
    const linkUrlGroup = document.getElementById('linkUrlGroup');
    const mediaUrlHint = document.getElementById('mediaUrlHint');

    mediaUrlGroup.style.display = 'none';
    linkUrlGroup.style.display = 'none';

    if (mediaType === 'image') {
        mediaUrlGroup.style.display = 'flex';
        mediaUrlHint.textContent = 'Enter the full URL to your image (e.g., https://example.com/image.jpg)';
    } else if (mediaType === 'video') {
        mediaUrlGroup.style.display = 'flex';
        mediaUrlHint.textContent = 'YouTube, Vimeo embed link, or direct video URL';
    } else if (mediaType === 'link') {
        linkUrlGroup.style.display = 'flex';
    }
}

function handleAddEntry(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const newEntry = {
        id: nextId++,
        title: formData.get('title').trim(),
        section: formData.get('section').trim(),
        date: formData.get('date'),
        content: formData.get('content').trim(),
        media_type: formData.get('media_type') || null,
        media_url: formData.get('media_url')?.trim() || null,
        link_url: formData.get('link_url')?.trim() || null
    };

    // Validate
    if (!newEntry.title || !newEntry.section || !newEntry.content) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Add entry
    allEntries.push(newEntry);
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Save and reset
    saveToLocalStorage();
    e.target.reset();

    // Set default date again
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entryDate').valueAsDate = new Date(today + 'T00:00:00');

    showNotification(`Entry "${newEntry.title}" added successfully!`, 'success');
    renderOverview();
}

/* =============================================================================
   MANAGE ENTRIES PANEL
   ============================================================================= */

function renderManagePanel() {
    updateFilterSections();
    filterEntries();
}

function updateFilterSections() {
    const select = document.getElementById('filterSection');
    const sections = getUniqueSections();

    const currentValue = select.value;
    select.innerHTML = '<option value="">All Sections</option>';

    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        select.appendChild(option);
    });

    select.value = currentValue;
}

function filterEntries() {
    const searchTerm = document.getElementById('searchEntries').value.toLowerCase();
    const sectionFilter = document.getElementById('filterSection').value;

    let filtered = allEntries;

    if (sectionFilter) {
        filtered = filtered.filter(e => e.section === sectionFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(searchTerm) ||
            e.content.toLowerCase().includes(searchTerm)
        );
    }

    renderEntriesList(filtered);
}

function renderEntriesList(entries) {
    const list = document.getElementById('entriesList');

    if (entries.length === 0) {
        list.innerHTML = '<div class="empty-state">No entries found.</div>';
        return;
    }

    list.innerHTML = entries.map(entry => `
        <div class="admin-entry-card">
            <div class="admin-entry-info">
                <h4>${escapeHtml(entry.title)}</h4>
                <div class="admin-entry-meta">
                    <span class="admin-entry-section">${escapeHtml(entry.section)}</span>
                    <span>${formatDate(entry.date)}</span>
                </div>
            </div>
            <div class="admin-entry-actions">
                <button class="btn-delete" onclick="showDeleteModal(${entry.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

/* =============================================================================
   DELETE FUNCTIONALITY
   ============================================================================= */

function showDeleteModal(entryId) {
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return;

    deleteTargetId = entryId;
    document.getElementById('deleteMessage').textContent = `Are you sure you want to delete "${escapeHtml(entry.title)}"? This action cannot be undone.`;

    const modal = document.getElementById('deleteModal');
    const overlay = document.getElementById('deleteOverlay');
    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeDeleteModal() {
    deleteTargetId = null;
    document.getElementById('deleteModal').classList.remove('active');
    document.getElementById('deleteOverlay').classList.remove('active');
}

function confirmDelete() {
    if (deleteTargetId === null) return;

    const entryIndex = allEntries.findIndex(e => e.id === deleteTargetId);
    if (entryIndex === -1) return;

    const deletedEntry = allEntries[entryIndex];
    allEntries.splice(entryIndex, 1);

    saveToLocalStorage();
    closeDeleteModal();

    showNotification(`Entry "${deletedEntry.title}" deleted successfully!`, 'success');
    filterEntries();
    renderOverview();
}

/* =============================================================================
   IMPORT/EXPORT FUNCTIONALITY
   ============================================================================= */

function exportEntries() {
    const dataStr = JSON.stringify({ entries: allEntries }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `entries-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Entries exported successfully!', 'success');
}

function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (!data.entries || !Array.isArray(data.entries)) {
                throw new Error('Invalid JSON structure. Expected { entries: [...] }');
            }

            // Merge entries, avoiding duplicates by ID
            const importedIds = new Set(data.entries.map(e => e.id));
            const idsToKeep = allEntries.filter(e => !importedIds.has(e.id));

            allEntries = [...idsToKeep, ...data.entries];
            allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Update next ID
            if (allEntries.length > 0) {
                nextId = Math.max(...allEntries.map(e => e.id)) + 1;
            }

            saveToLocalStorage();

            const status = document.getElementById('importStatus');
            status.className = 'success';
            status.innerHTML = `<strong>Success!</strong> Imported ${data.entries.length} entries. 
                               <strong>Next step:</strong> Download the JSON using the Export button above and replace your entries.json file.`;

            setTimeout(() => {
                renderOverview();
                switchPanel('overview');
                document.getElementById('importFile').value = '';
            }, 1500);

        } catch (error) {
            const status = document.getElementById('importStatus');
            status.className = 'error';
            status.textContent = `Error: ${error.message}`;
            document.getElementById('importFile').value = '';
        }
    };

    reader.readAsText(file);
}

/* =============================================================================
   UTILITY FUNCTIONS
   ============================================================================= */

function getUniqueSections() {
    const sections = new Set();
    allEntries.forEach(entry => {
        sections.add(entry.section);
    });
    return Array.from(sections).sort();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', options);
}

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

function showNotification(message, type = 'info') {
    // Create a simple notification (you could enhance this with a toast system)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
        color: white;
        border-radius: 6px;
        font-weight: 600;
        z-index: 9999;
        animation: slideUp 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/* Add animations for notifications */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
