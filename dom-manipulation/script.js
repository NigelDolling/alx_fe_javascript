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
    
    // Add new quote to array
    quotes.push({
        text: quoteText,
        category: quoteCategory
    });
    
    // Save to localStorage
    saveQuotes();
    
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
    if (existingFilter) return;
    
    const filterContainer = document.createElement('div');
    filterContainer.id = 'categoryFilter';
    filterContainer.innerHTML = `
        <label for="categorySelect">Filter by Category:</label>
        <select id="categorySelect" onchange="filterQuotesByCategory()">
            <option value="all">All Categories</option>
        </select>
    `;
    
    // Insert filter before quote display
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.parentNode.insertBefore(filterContainer, quoteDisplay);
    
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
    
    // Create additional control buttons
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls';
    controlsContainer.innerHTML = `
        <button onclick="createAddQuoteForm()">Add New Quote</button>
        <button onclick="exportQuotes()">Export Quotes</button>
        <input type="file" id="importFile" accept=".json" onchange="importQuotes(event)" style="display: none;">
        <button onclick="document.getElementById('importFile').click()">Import Quotes</button>
        <button onclick="clearAllData()">Clear All Data</button>
    `;
    
    // Insert controls after the new quote button
    const newQuoteBtn = document.getElementById('newQuote');
    newQuoteBtn.parentNode.insertBefore(controlsContainer, newQuoteBtn.nextSibling);
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

// Add some basic styling through JavaScript (optional - better to use CSS file)
function addBasicStyling() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .quote-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px 0;
        }
        
        blockquote {
            font-size: 1.2em;
            font-style: italic;
            margin: 0;
            color: #333;
        }
        
        .category {
            color: #666;
            font-size: 0.9em;
            margin-top: 10px;
        }
        
        #addQuoteForm {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px 0;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        
        textarea {
            height: 80px;
            resize: vertical;
        }
        
        button {
            background-color: #007bff;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        
        button:hover {
            background-color: #0056b3;
        }
        
        .success-message {
            color: green;
            margin-top: 10px;
            font-weight: bold;
        }
        
        #categoryFilter {
            margin: 20px 0;
        }
        
        #controls {
            margin: 20px 0;
        }
    `;
    document.head.appendChild(style);
}

// Apply basic styling when DOM loads
document.addEventListener('DOMContentLoaded', addBasicStyling);
