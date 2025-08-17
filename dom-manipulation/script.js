// Array to store quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "inspiration" },
    { text: "The only impossible journey is the one you never begin.", category: "motivation" },
    { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", category: "friendship" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success" },
    { text: "The way to get started is to quit talking and begin doing.", category: "action" }
];

// Local Storage Functions
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
}

function saveLastSelectedCategory(category) {
    localStorage.setItem('lastSelectedCategory', category);
}

function loadLastSelectedCategory() {
    return localStorage.getItem('lastSelectedCategory') || 'all';
}

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available. Add some quotes to get started!</p>';
        return;
    }
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    // Create and display quote with category
    quoteDisplay.innerHTML = `
        <div class="quote-container">
            <blockquote>"${randomQuote.text}"</blockquote>
            <p class="category">Category: ${randomQuote.category}</p>
        </div>
    `;
}

// Function to create form for adding new quotes
function createAddQuoteForm() {
    const existingForm = document.getElementById('addQuoteForm');
    if (existingForm) {
        existingForm.remove();
    }
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.id = 'addQuoteForm';
    formContainer.innerHTML = `
        <h3>Add New Quote</h3>
        <div class="form-group">
            <label for="newQuoteText">Quote Text:</label>
            <textarea id="newQuoteText" placeholder="Enter your quote here..." required></textarea>
        </div>
        <div class="form-group">
            <label for="newQuoteCategory">Category:</label>
            <input type="text" id="newQuoteCategory" placeholder="Enter category (e.g., motivation, life, success)" required>
        </div>
        <div class="form-buttons">
            <button onclick="addQuote()">Add Quote</button>
            <button onclick="cancelAddQuote()">Cancel</button>
        </div>
    `;
    
    // Insert form after quote display
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.parentNode.insertBefore(formContainer, quoteDisplay.nextSibling);
}

// Function to add a new quote to the array
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim().toLowerCase();
    
    if (!quoteText || !quoteCategory) {
        alert('Please fill in both quote text and category.');
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: quoteText,
        category: quoteCategory,
        source: 'local',
        timestamp: Date.now()
    };
    
    // Add new quote to array
    quotes.push(newQuote);
    
    // Save to localStorage
    saveQuotes();
    
    // Post to server if online
    if (isOnline) {
        postQuoteToServer(newQuote);
    }
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Quote added successfully!';
    
    const formContainer = document.getElementById('addQuoteForm');
    formContainer.appendChild(successMessage);
    
    // Remove success message and form after 2 seconds
    setTimeout(() => {
        cancelAddQuote();
    }, 2000);
    
    // Update categories dropdown if it exists
    updateCategoryFilter();
}

// Function to cancel adding quote (remove form)
function cancelAddQuote() {
    const formContainer = document.getElementById('addQuoteForm');
    if (formContainer) {
        formContainer.remove();
    }
}

// Function to create category filter
function createCategoryFilter() {
    const existingFilter = document.getElementById('categoryFilter');
    if (existingFilter) {
        populateCategories();
        return;
    }
    
    // Category filter is now in HTML, just populate it
    populateCategories();
}

// Function to populate categories dynamically (renamed from updateCategoryFilter)
function populateCategories() {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return;
    
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
    
    // Restore last selected category
    const lastSelected = loadLastSelectedCategory();
    categorySelect.value = lastSelected;
    
    // Apply the saved filter
    if (lastSelected !== 'all') {
        filterQuotesByCategory();
    }
}

// Update the updateCategoryFilter function to use the new name
function updateCategoryFilter() {
    populateCategories();
}

// Function to filter quotes by category
function filterQuotesByCategory() {
    const selectedCategory = document.getElementById('categorySelect').value;
    
    // Save the selected category to localStorage
    saveLastSelectedCategory(selectedCategory);
    
    if (selectedCategory === 'all') {
        showRandomQuote();
    } else {
        const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        
        if (filteredQuotes.length === 0) {
            document.getElementById('quoteDisplay').innerHTML = 
                `<p>No quotes found in the "${selectedCategory}" category.</p>`;
            return;
        }
        
        // Show random quote from filtered category
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        
        document.getElementById('quoteDisplay').innerHTML = `
            <div class="quote-container">
                <blockquote>"${randomQuote.text}"</blockquote>
                <p class="category">Category: ${randomQuote.category}</p>
            </div>
        `;
    }
}

// Function to export quotes (bonus feature)
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'quotes.json';
    link.click();
}

// Function to import quotes (bonus feature)
function importQuotes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes = [...quotes, ...importedQuotes];
                saveQuotes(); // Save to localStorage after import
                updateCategoryFilter();
                alert(`Successfully imported ${importedQuotes.length} quotes!`);
            } else {
                alert('Invalid file format. Please select a valid JSON file.');
            }
        } catch (error) {
            alert('Error reading file. Please select a valid JSON file.');
        }
    };
    reader.readAsText(file);
}

// Server Simulation and Data Syncing Functions
const SERVER_CONFIG = {
    baseUrl: 'https://jsonplaceholder.typicode.com/posts',
    syncInterval: 30000, // 30 seconds
    lastSyncKey: 'lastSyncTimestamp'
};

let syncInterval;
let isOnline = navigator.onLine;

// Simulate server quotes by transforming JSONPlaceholder posts
function transformPostToQuote(post) {
    const categories = ['motivation', 'life', 'inspiration', 'success', 'wisdom', 'happiness', 'growth'];
    return {
        id: post.id,
        text: post.title.charAt(0).toUpperCase() + post.title.slice(1) + '.',
        category: categories[post.id % categories.length],
        source: 'server',
        timestamp: Date.now()
    };
}

// Fetch quotes from server (simulated)
async function fetchQuotesFromServer() {
    try {
        showNotification('Syncing with server...', 'info');
        const response = await fetch(`${SERVER_CONFIG.baseUrl}?_limit=10`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        const serverQuotes = posts.map(transformPostToQuote);
        
        return serverQuotes;
    } catch (error) {
        console.error('Failed to fetch server quotes:', error);
        showNotification('Failed to sync with server. Working offline.', 'error');
        return [];
    }
}

// Post new quote to server (simulated)
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(SERVER_CONFIG.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: quote.text,
                body: `Category: ${quote.category}`,
                userId: 1
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        showNotification('Quote synced to server successfully', 'success');
        return result;
    } catch (error) {
        console.error('Failed to post quote to server:', error);
        showNotification('Failed to sync quote to server. Saved locally.', 'warning');
        return null;
    }
}

// Sync local data with server
async function syncWithServer() {
    if (!isOnline) {
        showNotification('Offline mode - sync will resume when online', 'warning');
        return;
    }

    try {
        const serverQuotes = await fetchQuotesFromServer();
        
        if (serverQuotes.length === 0) {
            return;
        }

        const localQuotes = [...quotes];
        const conflicts = [];
        let newQuotesAdded = 0;
        let quotesUpdated = 0;

        // Check for conflicts and new quotes
        serverQuotes.forEach(serverQuote => {
            const existingQuote = localQuotes.find(q => q.id === serverQuote.id);
            
            if (!existingQuote) {
                // New quote from server
                quotes.push(serverQuote);
                newQuotesAdded++;
            } else if (existingQuote.text !== serverQuote.text || existingQuote.category !== serverQuote.category) {
                // Conflict detected - server takes precedence
                const conflictInfo = {
                    id: serverQuote.id,
                    local: existingQuote,
                    server: serverQuote
                };
                conflicts.push(conflictInfo);
                
                // Update local quote with server data
                const index = quotes.findIndex(q => q.id === serverQuote.id);
                if (index !== -1) {
                    quotes[index] = { ...serverQuote };
                    quotesUpdated++;
                }
            }
        });

        // Save updated quotes to localStorage
        if (newQuotesAdded > 0 || quotesUpdated > 0) {
            saveQuotes();
            updateCategoryFilter();
            
            // Show sync results
            let message = `Sync complete: `;
            if (newQuotesAdded > 0) message += `${newQuotesAdded} new quotes added`;
            if (quotesUpdated > 0) {
                if (newQuotesAdded > 0) message += ', ';
                message += `${quotesUpdated} quotes updated`;
            }
            
            showNotification(message, 'success');
            
            // Handle conflicts
            if (conflicts.length > 0) {
                handleConflicts(conflicts);
            }
        } else {
            showNotification('Data is up to date', 'info');
        }

        // Update last sync timestamp
        localStorage.setItem(SERVER_CONFIG.lastSyncKey, Date.now().toString());
        
    } catch (error) {
        console.error('Sync failed:', error);
        showNotification('Sync failed. Will retry automatically.', 'error');
    }
}

// Handle conflicts with user notification
function handleConflicts(conflicts) {
    const conflictMessage = `${conflicts.length} conflict(s) resolved. Server data took precedence.`;
    showNotification(conflictMessage, 'warning', 5000);
    
    // Log conflicts for debugging
    console.log('Conflicts resolved:', conflicts);
    
    // Show conflict details if user wants to see them
    setTimeout(() => {
        if (confirm('Would you like to see details about the resolved conflicts?')) {
            showConflictDetails(conflicts);
        }
    }, 1000);
}

// Show conflict details in a modal-like interface
function showConflictDetails(conflicts) {
    const existingModal = document.getElementById('conflictModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'conflictModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Conflict Resolution Details</h3>
            <p>The following conflicts were automatically resolved (server data was used):</p>
            <div class="conflict-list">
                ${conflicts.map(conflict => `
                    <div class="conflict-item">
                        <h4>Quote ID: ${conflict.id}</h4>
                        <div class="conflict-comparison">
                            <div class="local-version">
                                <strong>Your Version:</strong>
                                <p>"${conflict.local.text}"</p>
                                <small>Category: ${conflict.local.category}</small>
                            </div>
                            <div class="server-version">
                                <strong>Server Version (Applied):</strong>
                                <p>"${conflict.server.text}"</p>
                                <small>Category: ${conflict.server.category}</small>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="closeConflictModal()">Close</button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Close conflict modal
function closeConflictModal() {
    const modal = document.getElementById('conflictModal');
    if (modal) {
        modal.remove();
    }
}

// Show notification system
function showNotification(message, type = 'info', duration = 3000) {
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="closeNotification()" class="close-btn">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto-hide notification
    setTimeout(() => {
        closeNotification();
    }, duration);
}

// Close notification
function closeNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.remove();
    }
}

// Start periodic sync
function startPeriodicSync() {
    // Initial sync
    setTimeout(() => {
        syncWithServer();
    }, 2000); // Wait 2 seconds after page load

    // Set up periodic sync
    syncInterval = setInterval(() => {
        syncWithServer();
    }, SERVER_CONFIG.syncInterval);
}

// Stop periodic sync
function stopPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

// Handle online/offline status
function handleOnlineStatus() {
    isOnline = navigator.onLine;
    
    if (isOnline) {
        showNotification('Back online - resuming sync', 'success');
        startPeriodicSync();
    } else {
        showNotification('Gone offline - sync paused', 'warning');
        stopPeriodicSync();
    }
}

// Manual sync function
function manualSync() {
    showNotification('Manual sync initiated...', 'info');
    syncWithServer();
}

// Get last sync time
function getLastSyncTime() {
    const timestamp = localStorage.getItem(SERVER_CONFIG.lastSyncKey);
    return timestamp ? new Date(parseInt(timestamp)) : null;
}

// Show sync status
function showSyncStatus() {
    const lastSync = getLastSyncTime();
    const status = lastSync ? 
        `Last sync: ${lastSync.toLocaleString()}` : 
        'Never synced';
    
    const onlineStatus = isOnline ? 'Online' : 'Offline';
    showNotification(`${onlineStatus} | ${status}`, 'info', 5000);
}

// Sync quotes function - main synchronization entry point
function syncQuotes() {
    if (!isOnline) {
        showNotification('Cannot sync - currently offline', 'warning');
        return;
    }
    
    showNotification('Starting quote synchronization...', 'info');
    syncWithServer();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from localStorage first
    loadQuotes();
    
    // Show initial random quote
    showRandomQuote();
    
    // Create category filter
    createCategoryFilter();
    
    // Add event listener to the "Show New Quote" button
    const newQuoteButton = document.getElementById('newQuote');
    if (newQuoteButton) {
        newQuoteButton.addEventListener('click', showRandomQuote);
    }
    
    // Set up online/offline event listeners
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Start periodic sync
    startPeriodicSync();
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    stopPeriodicSync();
});

// Additional utility function to clear all stored data
function clearAllData() {
    if (confirm('Are you sure you want to clear all quotes and reset to defaults? This cannot be undone.')) {
        localStorage.removeItem('quotes');
        localStorage.removeItem('lastSelectedCategory');
        
        // Reset to default quotes
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "motivation" },
            { text: "Life is what happens to you while you're busy making other plans.", category: "life" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "dreams" },
            { text: "It is during our darkest moments that we must focus to see the light.", category: "inspiration" },
            { text: "The only impossible journey is the one you never begin.", category: "motivation" },
            { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", category: "friendship" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success" },
            { text: "The way to get started is to quit talking and begin doing.", category: "action" }
        ];
        
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert('All data cleared and reset to defaults!');
    }
}
