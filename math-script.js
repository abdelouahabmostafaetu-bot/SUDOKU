// ==========================================
// MATHEMATICIAN WEBSITE - JAVASCRIPT
// ==========================================

// Storage Keys
const STORAGE_KEYS = {
    ARTICLES: 'math_articles',
    BOOKS: 'math_books',
    ADVICE: 'math_advice',
    NOTES: 'math_notes',
    THEME: 'math_theme',
    STATS: 'math_stats'
};

// Initialize Data Storage
let articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES)) || [];
let books = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKS)) || [];
let advice = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADVICE)) || initializeAdvice();
let notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
let currentNoteId = null;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    loadAllContent();
    setupEventListeners();
    animateStats();
    initializeScrollEffects();
});

function initializeTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
}

function updateThemeToggle(theme) {
    const toggle = document.getElementById('themeToggle');
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ==========================================
// NAVIGATION
// ==========================================

function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelector(target).scrollIntoView({
                behavior: 'smooth'
            });
            
            navMenu.classList.remove('active');
        });
    });
    
    // Sticky navbar
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ==========================================
// THEME TOGGLE
// ==========================================

document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeToggle(newTheme);
    showToast('Theme changed!', 'success');
});

// ==========================================
// ARTICLES
// ==========================================

function loadArticles(filter = 'all') {
    const grid = document.getElementById('articlesGrid');
    const filteredArticles = filter === 'all' 
        ? articles 
        : articles.filter(a => a.category === filter);
    
    if (filteredArticles.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No articles yet. Add your first article below!</p>';
        return;
    }
    
    grid.innerHTML = filteredArticles.map(article => `
        <div class="article-card" data-id="${article.id}">
            <div class="card-header">
                <span class="card-category">${article.category}</span>
                <span class="card-date">${article.date}</span>
            </div>
            <h3 class="card-title">${article.title}</h3>
            <p class="card-abstract">${article.abstract}</p>
            ${article.keywords ? `<p style="font-size: 0.875rem; color: var(--text-light);"><strong>Keywords:</strong> ${article.keywords}</p>` : ''}
            <div class="card-footer">
                <button class="card-btn view-article" data-id="${article.id}">Read Full Article</button>
                <div class="card-actions">
                    <button class="card-btn edit-article" data-id="${article.id}">Edit</button>
                    <button class="card-btn delete delete-article" data-id="${article.id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    attachArticleEventListeners();
}

document.getElementById('articleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const article = {
        id: Date.now(),
        title: document.getElementById('articleTitle').value,
        category: document.getElementById('articleCategory').value,
        abstract: document.getElementById('articleAbstract').value,
        content: document.getElementById('articleContent').value,
        keywords: document.getElementById('articleKeywords').value,
        date: new Date().toLocaleDateString()
    };
    
    articles.push(article);
    saveArticles();
    loadArticles();
    e.target.reset();
    showToast('Article published successfully!', 'success');
    updateStats();
});

function attachArticleEventListeners() {
    document.querySelectorAll('.view-article').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const article = articles.find(a => a.id === id);
            showArticleModal(article);
        });
    });
    
    document.querySelectorAll('.delete-article').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this article?')) {
                const id = parseInt(e.target.dataset.id);
                articles = articles.filter(a => a.id !== id);
                saveArticles();
                loadArticles();
                showToast('Article deleted!', 'success');
                updateStats();
            }
        });
    });
}

function showArticleModal(article) {
    const modal = createModal('Article Details', `
        <div style="padding: 2rem;">
            <h2>${article.title}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                <strong>Category:</strong> ${article.category} | 
                <strong>Date:</strong> ${article.date}
            </p>
            <h3>Abstract</h3>
            <p style="margin-bottom: 1.5rem;">${article.abstract}</p>
            <h3>Full Content</h3>
            <div style="line-height: 1.8; white-space: pre-wrap;">${article.content}</div>
            ${article.keywords ? `<p style="margin-top: 1.5rem;"><strong>Keywords:</strong> ${article.keywords}</p>` : ''}
        </div>
    `);
    document.body.appendChild(modal);
}

function saveArticles() {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
}

// Article Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        loadArticles(e.target.dataset.filter);
    });
});

// ==========================================
// BOOKS & RESOURCES
// ==========================================

function loadBooks() {
    const grid = document.getElementById('booksGrid');
    
    if (books.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No books yet. Add your first resource below!</p>';
        return;
    }
    
    grid.innerHTML = books.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="card-header">
                <span class="card-category">${book.type}</span>
            </div>
            <h3 class="card-title">${book.title}</h3>
            <p style="color: var(--primary-color); font-weight: 600; margin-bottom: 0.5rem;">by ${book.author}</p>
            <p class="card-description">${book.description}</p>
            ${book.pages ? `<p style="font-size: 0.875rem; color: var(--text-light);">📄 ${book.pages} pages</p>` : ''}
            <div class="card-footer">
                ${book.pdfUrl ? `<a href="${book.pdfUrl}" target="_blank" class="card-btn">📥 Download PDF</a>` : '<span class="card-btn" style="opacity: 0.5;">No PDF available</span>'}
                <div class="card-actions">
                    <button class="card-btn delete delete-book" data-id="${book.id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    attachBookEventListeners();
}

document.getElementById('bookForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const book = {
        id: Date.now(),
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        type: document.getElementById('bookType').value,
        description: document.getElementById('bookDescription').value,
        pdfUrl: document.getElementById('bookPdfUrl').value,
        pages: document.getElementById('bookPages').value
    };
    
    books.push(book);
    saveBooks();
    loadBooks();
    e.target.reset();
    showToast('Resource added successfully!', 'success');
    updateStats();
});

function attachBookEventListeners() {
    document.querySelectorAll('.delete-book').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this resource?')) {
                const id = parseInt(e.target.dataset.id);
                books = books.filter(b => b.id !== id);
                saveBooks();
                loadBooks();
                showToast('Resource deleted!', 'success');
                updateStats();
            }
        });
    });
}

function saveBooks() {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
}

// ==========================================
// ADVICE SYSTEM
// ==========================================

function initializeAdvice() {
    return {
        students: [
            {
                id: 1,
                title: "Start with the Fundamentals",
                content: "Master basic concepts before moving to advanced topics. Strong foundations in algebra, calculus, and logic will serve you throughout your mathematical journey."
            },
            {
                id: 2,
                title: "Practice Daily",
                content: "Mathematics is like a muscle - it needs regular exercise. Solve at least one problem every day to keep your skills sharp."
            },
            {
                id: 3,
                title: "Ask Questions",
                content: "Never hesitate to ask questions. The most successful mathematicians are those who ask 'why' and 'what if' constantly."
            }
        ],
        researchers: [
            {
                id: 4,
                title: "Read Widely",
                content: "Stay updated with current research in your field and related areas. Cross-pollination of ideas often leads to breakthroughs."
            },
            {
                id: 5,
                title: "Collaborate",
                content: "Work with other researchers. Different perspectives can illuminate problems in ways you never imagined."
            }
        ],
        career: [
            {
                id: 6,
                title: "Build a Portfolio",
                content: "Document your work, publish papers, and contribute to open-source mathematical projects. Your portfolio speaks louder than words."
            }
        ],
        study: [
            {
                id: 7,
                title: "Use Multiple Resources",
                content: "Different textbooks and sources explain concepts differently. Find the explanation that resonates with you."
            },
            {
                id: 8,
                title: "Teach Others",
                content: "The best way to test your understanding is to teach. If you can explain it simply, you truly understand it."
            }
        ]
    };
}

function loadAdvice(category = 'students') {
    const grid = document.getElementById(`${category}AdviceGrid`);
    const adviceList = advice[category] || [];
    
    grid.innerHTML = adviceList.map(item => `
        <div class="advice-card">
            <div class="card-icon" style="font-size: 2rem; margin-bottom: 1rem;">💡</div>
            <h4 class="card-title">${item.title}</h4>
            <p class="card-content">${item.content}</p>
            <button class="card-btn delete delete-advice" data-category="${category}" data-id="${item.id}">Delete</button>
        </div>
    `).join('');
    
    attachAdviceEventListeners();
}

document.querySelectorAll('.advice-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const category = e.target.dataset.tab;
        
        document.querySelectorAll('.advice-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        document.querySelectorAll('.advice-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(category).classList.add('active');
    });
});

document.getElementById('adviceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const category = document.getElementById('adviceCategory').value;
    const newAdvice = {
        id: Date.now(),
        title: document.getElementById('adviceTitle').value,
        content: document.getElementById('adviceContent').value
    };
    
    if (!advice[category]) advice[category] = [];
    advice[category].push(newAdvice);
    
    saveAdvice();
    loadAdvice(category);
    e.target.reset();
    showToast('Advice shared successfully!', 'success');
});

function attachAdviceEventListeners() {
    document.querySelectorAll('.delete-advice').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this advice?')) {
                const category = e.target.dataset.category;
                const id = parseInt(e.target.dataset.id);
                advice[category] = advice[category].filter(a => a.id !== id);
                saveAdvice();
                loadAdvice(category);
                showToast('Advice deleted!', 'success');
            }
        });
    });
}

function saveAdvice() {
    localStorage.setItem(STORAGE_KEYS.ADVICE, JSON.stringify(advice));
}

// ==========================================
// NOTES SYSTEM
// ==========================================

function loadNotes(searchTerm = '') {
    const grid = document.getElementById('notesGrid');
    let filteredNotes = notes;
    
    if (searchTerm) {
        filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.category && note.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    if (filteredNotes.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No notes found. Click "New Note" to create one!</p>';
        return;
    }
    
    grid.innerHTML = filteredNotes.map(note => `
        <div class="note-card ${note.important ? 'important' : ''}" data-id="${note.id}">
            ${note.important ? '<div class="note-icon">⭐</div>' : ''}
            <div class="card-header">
                ${note.category ? `<span class="card-category">${note.category}</span>` : ''}
                <span class="card-date">${note.date}</span>
            </div>
            <h4 class="card-title">${note.title}</h4>
            <p class="card-content">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
            <div class="card-footer">
                <button class="card-btn view-note" data-id="${note.id}">View Full</button>
                <div class="card-actions">
                    <button class="card-btn edit-note" data-id="${note.id}">Edit</button>
                    <button class="card-btn delete delete-note" data-id="${note.id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    attachNoteEventListeners();
}

document.getElementById('addNoteBtn').addEventListener('click', () => {
    currentNoteId = null;
    document.getElementById('noteModalTitle').textContent = 'New Note';
    document.getElementById('noteForm').reset();
    document.getElementById('noteModal').classList.add('active');
});

document.getElementById('noteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const noteData = {
        title: document.getElementById('noteTitle').value,
        category: document.getElementById('noteCategory').value,
        content: document.getElementById('noteContent').value,
        important: document.getElementById('noteImportant').checked,
        date: new Date().toLocaleDateString()
    };
    
    if (currentNoteId) {
        const index = notes.findIndex(n => n.id === currentNoteId);
        notes[index] = { ...notes[index], ...noteData };
        showToast('Note updated!', 'success');
    } else {
        noteData.id = Date.now();
        notes.unshift(noteData);
        showToast('Note created!', 'success');
    }
    
    saveNotes();
    loadNotes();
    closeNoteModal();
});

document.getElementById('closeNoteModal').addEventListener('click', closeNoteModal);
document.getElementById('cancelNote').addEventListener('click', closeNoteModal);

function closeNoteModal() {
    document.getElementById('noteModal').classList.remove('active');
    currentNoteId = null;
}

function attachNoteEventListeners() {
    document.querySelectorAll('.view-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const note = notes.find(n => n.id === id);
            showNoteViewModal(note);
        });
    });
    
    document.querySelectorAll('.edit-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const note = notes.find(n => n.id === id);
            editNote(note);
        });
    });
    
    document.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this note?')) {
                const id = parseInt(e.target.dataset.id);
                notes = notes.filter(n => n.id !== id);
                saveNotes();
                loadNotes();
                showToast('Note deleted!', 'success');
            }
        });
    });
}

function editNote(note) {
    currentNoteId = note.id;
    document.getElementById('noteModalTitle').textContent = 'Edit Note';
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteCategory').value = note.category || '';
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteImportant').checked = note.important || false;
    document.getElementById('noteModal').classList.add('active');
}

function showNoteViewModal(note) {
    const modal = createModal(note.title, `
        <div style="padding: 2rem;">
            ${note.category ? `<p style="color: var(--primary-color); font-weight: 600; margin-bottom: 0.5rem;">📁 ${note.category}</p>` : ''}
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">📅 ${note.date}</p>
            ${note.important ? '<p style="color: #ffc107; font-weight: 600; margin-bottom: 1rem;">⭐ Important</p>' : ''}
            <div style="line-height: 1.8; white-space: pre-wrap;">${note.content}</div>
        </div>
    `);
    document.body.appendChild(modal);
}

document.getElementById('notesSearch').addEventListener('input', (e) => {
    loadNotes(e.target.value);
});

function saveNotes() {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

// ==========================================
// CONTACT FORM
// ==========================================

document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value
    };
    
    console.log('Contact form submitted:', formData);
    showToast('Message sent! I will get back to you soon.', 'success');
    e.target.reset();
    
    // In a real application, you would send this to a server
});

// ==========================================
// UTILITIES
// ==========================================

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            ${content}
        </div>
    `;
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const messageEl = document.getElementById('toastMessage');
    
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ'
    };
    
    icon.textContent = icons[type] || icons.info;
    messageEl.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function animateStats() {
    animateCounter('articlesCount', articles.length);
    animateCounter('booksCount', books.length);
    animateCounter('studentsHelped', 150 + articles.length * 10);
}

function animateCounter(id, target) {
    const element = document.getElementById(id);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

function updateStats() {
    animateStats();
}

// ==========================================
// SCROLL EFFECTS
// ==========================================

function initializeScrollEffects() {
    const scrollTop = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    });
    
    scrollTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==========================================
// LOAD ALL CONTENT
// ==========================================

function loadAllContent() {
    loadArticles();
    loadBooks();
    loadAdvice('students');
    loadAdvice('researchers');
    loadAdvice('career');
    loadAdvice('study');
    loadNotes();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Modal background clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ==========================================
// EXPORT/IMPORT FUNCTIONS
// ==========================================

function exportData() {
    const data = {
        articles,
        books,
        advice,
        notes,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mathematician-data-${Date.now()}.json`;
    link.click();
    
    showToast('Data exported successfully!', 'success');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all current data. Are you sure?')) {
                articles = data.articles || [];
                books = data.books || [];
                advice = data.advice || initializeAdvice();
                notes = data.notes || [];
                
                saveArticles();
                saveBooks();
                saveAdvice();
                saveNotes();
                
                loadAllContent();
                updateStats();
                
                showToast('Data imported successfully!', 'success');
            }
        } catch (error) {
            showToast('Error importing data. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Make functions available globally for potential future use
window.exportData = exportData;
window.importData = importData;
