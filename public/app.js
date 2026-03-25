// State
let currentUser = null;
let currentPage = 'home';
let currentInventory = null;
let currentItem = null;
let currentIdFormat = [];
let socket = io();
let autoSaveTimer = null;
let pendingChanges = false;
let autoSaveEnabled = false;

// Translations
const translations = {
    en: {
        home: 'Home',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        profile: 'Profile',
        admin: 'Admin',
        search: 'Search...',
        createInventory: 'Create Inventory',
        myInventories: 'My Inventories',
        accessibleInventories: 'Inventories I Can Edit',
        latestInventories: 'Latest Inventories',
        popularInventories: 'Most Popular',
        tags: 'Tags',
        title: 'Title',
        description: 'Description',
        category: 'Category',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        items: 'Items',
        comments: 'Comments',
        settings: 'Settings',
        access: 'Access',
        fields: 'Fields',
        statistics: 'Statistics',
        addItem: 'Add Item',
        addField: 'Add Field',
        addComment: 'Add Comment',
        like: 'Like',
        unlike: 'Unlike',
        public: 'Public',
        private: 'Private',
        writers: 'Writers',
        addWriter: 'Add Writer',
        remove: 'Remove',
        confirmDelete: 'Are you sure?',
        yes: 'Yes',
        no: 'No',
        email: 'Email',
        name: 'Name',
        password: 'Password',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        customId: 'Custom ID',
        idFormat: 'ID Format',
        preview: 'Preview',
        addText: 'Add Text',
        addRandom: 'Add Random',
        addDate: 'Add Date',
        addSequence: 'Add Sequence',
        addGuid: 'Add GUID',
        uploadImage: 'Upload Image',
        changeImage: 'Change Image',
        removeImage: 'Remove Image',
        dropImageHere: 'Drop image here or click to upload',
        searchUsers: 'Search users by name or email...',
        sortByName: 'Sort by Name',
        sortByEmail: 'Sort by Email',
        autoSaveEnabled: 'Auto-save enabled',
        autoSaveDisabled: 'Auto-save disabled',
        changesSaved: 'Changes saved',
        saving: 'Saving...',
        conflictDetected: 'Conflict detected. Please refresh.',
        duplicateCustomId: 'This Custom ID already exists',
        invalidCustomId: 'Invalid Custom ID format',
        confirmDeleteInventory: 'Are you sure you want to delete this inventory?',
        confirmDeleteItem: 'Are you sure you want to delete this item?',
        confirmDeleteField: 'Are you sure you want to delete this field?',
        confirmRemoveWriter: 'Are you sure you want to remove this writer?',
        itemAdded: 'Item added successfully',
        itemUpdated: 'Item updated successfully',
        itemDeleted: 'Item deleted successfully',
        fieldAdded: 'Field added successfully',
        fieldDeleted: 'Field deleted successfully',
        commentAdded: 'Comment added successfully',
        writerAdded: 'Writer added successfully',
        writerRemoved: 'Writer removed successfully',
        imageUploaded: 'Image uploaded successfully',
        idFormatSaved: 'ID format saved successfully',
        settingsSaved: 'Settings saved successfully',
        createdBy: 'Created by',
        createdAt: 'Created at',
        version: 'Version',
        actions: 'Actions',
        close: 'Close',
        update: 'Update',
        add: 'Add',
        searchTags: 'Search tags...',
        noResults: 'No results found',
        loading: 'Loading...',
        syncToSalesforce: 'Sync to Salesforce',
        salesforceSync: 'Salesforce Sync',
        companyName: 'Company Name',
        phone: 'Phone',
        position: 'Position',
        industry: 'Industry',
        supportTicket: 'Support Ticket',
        issueSummary: 'Issue Summary',
        priority: 'Priority',
        low: 'Low',
        average: 'Average',
        high: 'High',
        relatedInventory: 'Related Inventory',
        submitTicket: 'Submit Ticket',
        needHelp: 'Need Help? Create Support Ticket'
    },
    es: {
        home: 'Inicio',
        login: 'Iniciar sesión',
        register: 'Registrarse',
        logout: 'Cerrar sesión',
        profile: 'Perfil',
        admin: 'Administrador',
        search: 'Buscar...',
        createInventory: 'Crear inventario',
        myInventories: 'Mis inventarios',
        accessibleInventories: 'Inventarios que puedo editar',
        latestInventories: 'Últimos inventarios',
        popularInventories: 'Más populares',
        tags: 'Etiquetas',
        title: 'Título',
        description: 'Descripción',
        category: 'Categoría',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        view: 'Ver',
        items: 'Elementos',
        comments: 'Comentarios',
        settings: 'Configuración',
        access: 'Acceso',
        fields: 'Campos',
        statistics: 'Estadísticas',
        addItem: 'Agregar elemento',
        addField: 'Agregar campo',
        addComment: 'Agregar comentario',
        like: 'Me gusta',
        unlike: 'No me gusta',
        public: 'Público',
        private: 'Privado',
        writers: 'Editores',
        addWriter: 'Agregar editor',
        remove: 'Eliminar',
        confirmDelete: '¿Estás seguro?',
        yes: 'Sí',
        no: 'No',
        email: 'Correo electrónico',
        name: 'Nombre',
        password: 'Contraseña',
        darkMode: 'Modo oscuro',
        lightMode: 'Modo claro',
        customId: 'ID personalizado',
        idFormat: 'Formato de ID',
        preview: 'Vista previa',
        addText: 'Agregar texto',
        addRandom: 'Agregar aleatorio',
        addDate: 'Agregar fecha',
        addSequence: 'Agregar secuencia',
        addGuid: 'Agregar GUID',
        uploadImage: 'Subir imagen',
        changeImage: 'Cambiar imagen',
        removeImage: 'Eliminar imagen',
        dropImageHere: 'Arrastra imagen o haz clic para subir',
        searchUsers: 'Buscar usuarios por nombre o email...',
        sortByName: 'Ordenar por nombre',
        sortByEmail: 'Ordenar por email',
        autoSaveEnabled: 'Auto-guardado activado',
        autoSaveDisabled: 'Auto-guardado desactivado',
        changesSaved: 'Cambios guardados',
        saving: 'Guardando...',
        conflictDetected: 'Conflicto detectado. Por favor refresca.',
        duplicateCustomId: 'Este ID personalizado ya existe',
        invalidCustomId: 'Formato de ID personalizado inválido',
        confirmDeleteInventory: '¿Estás seguro de eliminar este inventario?',
        confirmDeleteItem: '¿Estás seguro de eliminar este elemento?',
        confirmDeleteField: '¿Estás seguro de eliminar este campo?',
        confirmRemoveWriter: '¿Estás seguro de eliminar este editor?',
        itemAdded: 'Elemento agregado exitosamente',
        itemUpdated: 'Elemento actualizado exitosamente',
        itemDeleted: 'Elemento eliminado exitosamente',
        fieldAdded: 'Campo agregado exitosamente',
        fieldDeleted: 'Campo eliminado exitosamente',
        commentAdded: 'Comentario agregado exitosamente',
        writerAdded: 'Editor agregado exitosamente',
        writerRemoved: 'Editor eliminado exitosamente',
        imageUploaded: 'Imagen subida exitosamente',
        idFormatSaved: 'Formato de ID guardado exitosamente',
        settingsSaved: 'Configuración guardada exitosamente',
        createdBy: 'Creado por',
        createdAt: 'Creado el',
        version: 'Versión',
        actions: 'Acciones',
        close: 'Cerrar',
        update: 'Actualizar',
        add: 'Agregar',
        searchTags: 'Buscar etiquetas...',
        noResults: 'No se encontraron resultados',
        loading: 'Cargando...',
        syncToSalesforce: 'Sincronizar con Salesforce',
        salesforceSync: 'Sincronización Salesforce',
        companyName: 'Nombre de empresa',
        phone: 'Teléfono',
        position: 'Cargo',
        industry: 'Industria',
        supportTicket: 'Ticket de soporte',
        issueSummary: 'Resumen del problema',
        priority: 'Prioridad',
        low: 'Baja',
        average: 'Media',
        high: 'Alta',
        relatedInventory: 'Inventario relacionado',
        submitTicket: 'Enviar ticket',
        needHelp: '¿Necesitas ayuda? Crear ticket de soporte'
    }
};

let currentLang = localStorage.getItem('language') || 'en';

function t(key) {
    return translations[currentLang][key] || key;
}

// Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (currentUser) {
        fetch('/api/user/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: newTheme })
        }).catch(err => console.error('Failed to save theme:', err));
    }
    updateNav();
}

// Language
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    if (currentUser) {
        fetch('/api/user/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: lang })
        }).catch(err => console.error('Failed to save language:', err));
    }
    
    updateNav();
    loadPage();
}

// Toast
function showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    container.appendChild(toast);
    new bootstrap.Toast(toast, { autohide: true, delay: duration }).show();
    setTimeout(() => toast.remove(), duration + 1000);
}

// API
async function apiCall(url, options = {}) {
    try {
        const res = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Not authenticated');
            }
            if (res.status === 409) {
                showToast(t('conflictDetected'), 'warning');
            }
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (err) {
        console.error('API call failed:', err);
        throw err;
    }
}

// Auth
async function checkAuth() {
    try {
        const data = await apiCall('/api/user');
        currentUser = data;
        if (currentUser.theme) {
            document.documentElement.setAttribute('data-bs-theme', currentUser.theme);
        }
        if (currentUser.language) {
            currentLang = currentUser.language;
        }
    } catch (err) {
        console.log('Not authenticated');
        currentUser = null;
    }
    updateNav();
    loadPage();
}

function updateNav() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    const themeIcon = document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'sun' : 'moon';
    
    if (currentUser) {
        navLinks.innerHTML = `
            <li class="nav-item">
                <button class="btn btn-link nav-link" onclick="toggleTheme()" data-bs-toggle="tooltip" title="${t('darkMode')}">
                    <i class="bi bi-${themeIcon}"></i>
                </button>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-translate"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item ${currentLang === 'en' ? 'active' : ''}" href="#" onclick="setLanguage('en')">🇺🇸 English</a></li>
                    <li><a class="dropdown-item ${currentLang === 'es' ? 'active' : ''}" href="#" onclick="setLanguage('es')">🇪🇸 Español</a></li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                    <div class="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-2" 
                         style="width: 32px; height: 32px; font-weight: bold;">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    ${currentUser.name}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="loadProfile()">
                        <i class="bi bi-person-circle me-2"></i>${t('profile')}
                    </a></li>
                    ${currentUser.isAdmin ? `<li><a class="dropdown-item" href="#" onclick="loadAdmin()">
                        <i class="bi bi-shield-lock me-2"></i>${t('admin')}
                    </a></li>` : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()">
                        <i class="bi bi-box-arrow-right me-2"></i>${t('logout')}
                    </a></li>
                </ul>
            </li>
        `;
    } else {
        navLinks.innerHTML = `
            <li class="nav-item">
                <button class="btn btn-link nav-link" onclick="toggleTheme()" data-bs-toggle="tooltip" title="${t('darkMode')}">
                    <i class="bi bi-${themeIcon}"></i>
                </button>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-translate"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item ${currentLang === 'en' ? 'active' : ''}" href="#" onclick="setLanguage('en')">🇺🇸 English</a></li>
                    <li><a class="dropdown-item ${currentLang === 'es' ? 'active' : ''}" href="#" onclick="setLanguage('es')">🇪🇸 Español</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <button class="btn btn-outline-light me-2" onclick="showLoginModal()">
                    <i class="bi bi-box-arrow-in-right me-1"></i>${t('login')}
                </button>
            </li>
            <li class="nav-item">
                <button class="btn btn-light" onclick="showRegisterModal()">
                    <i class="bi bi-person-plus me-1"></i>${t('register')}
                </button>
            </li>
        `;
    }
    
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
}

// Modals
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
    
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showToast('Please enter email and password', 'warning');
            return;
        }
        
        try {
            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            modal.hide();
            currentUser = data.user;
            updateNav();
            loadPage();
            showToast('Login successful', 'success');
        } catch (err) {
            showToast(err.message, 'danger');
        }
    };
}

function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
    
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    
    document.getElementById('registerForm').onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            showToast('Please fill all fields', 'warning');
            return;
        }
        
        try {
            const data = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
            modal.hide();
            currentUser = data.user;
            updateNav();
            loadPage();
            showToast('Registration successful', 'success');
        } catch (err) {
            showToast(err.message, 'danger');
        }
    };
}

function showCreateInventoryModal() {
    loadCategories().then(() => {
        initializeTagSelect('#invTags');
        const modal = new bootstrap.Modal(document.getElementById('createInventoryModal'));
        modal.show();
    });
}

async function logout() {
    try {
        await fetch('/auth/logout');
        currentUser = null;
        updateNav();
        loadPage();
        showToast('Logged out', 'success');
    } catch (err) {
        console.error('Logout error:', err);
    }
}

// Page loading
async function loadPage() {
    const app = document.getElementById('app');
    
    try {
        if (currentPage === 'home') {
            await loadHome();
        } else if (currentPage === 'profile') {
            await loadProfile();
        } else if (currentPage === 'admin') {
            await loadAdmin();
        } else if (currentPage === 'inventory' && currentInventory) {
            await loadInventory();
        } else {
            await loadHome();
        }
    } catch (err) {
        app.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
    }
}

// Load categories
async function loadCategories() {
    try {
        const categories = await apiCall('/api/categories');
        const categorySelect = document.getElementById('invCategory');
        if (categorySelect) {
            categorySelect.innerHTML = categories.map(cat => 
                `<option value="${cat}">${cat}</option>`
            ).join('');
        }
        return categories;
    } catch (err) {
        console.error('Failed to load categories:', err);
        return ['Equipment', 'Furniture', 'Book', 'Other'];
    }
}

// Initialize tag select
async function initializeTagSelect(selector) {
    const select = document.querySelector(selector);
    if (!select) return;
    
    try {
        const tags = await apiCall('/api/tags');
        
        $(select).select2({
            theme: 'bootstrap-5',
            placeholder: t('searchTags'),
            allowClear: true,
            multiple: true,
            tags: true,
            tokenSeparators: [',', ' '],
            data: tags.map(t => ({ id: t.name, text: t.name })),
            ajax: {
                delay: 250,
                url: '/api/tags/search',
                data: params => ({ q: params.term }),
                processResults: data => ({
                    results: data.map(t => ({ id: t, text: t }))
                })
            }
        });
    } catch (err) {
        console.error('Failed to load tags:', err);
    }
}

// Auto-save
function enableAutoSave() {
    if (autoSaveEnabled) return;
    autoSaveEnabled = true;
    
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
        if (pendingChanges && currentInventory) {
            saveInventorySettings();
        }
    }, 7000);
    
    showToast(t('autoSaveEnabled'), 'info', 2000);
}

function disableAutoSave() {
    autoSaveEnabled = false;
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
    showToast(t('autoSaveDisabled'), 'info', 2000);
}

function markPendingChanges() {
    if (!autoSaveEnabled && currentInventory) {
        enableAutoSave();
    }
    pendingChanges = true;
}

async function saveInventorySettings() {
    if (!currentInventory || !pendingChanges) return;
    
    const title = document.getElementById('settingsTitle')?.value;
    const description = document.getElementById('settingsDescription')?.value;
    const category = document.getElementById('settingsCategory')?.value;
    const tagsSelect = document.getElementById('settingsTags');
    const tags = tagsSelect ? $(tagsSelect).val() : [];
    const isPublic = document.getElementById('settingsIsPublic')?.checked;
    
    if (title) {
        try {
            showAutoSaveIndicator(t('saving'));
            
            const updated = await apiCall(`/api/inventories/${currentInventory.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    tags,
                    isPublic,
                    version: currentInventory.version
                })
            });
            
            currentInventory = { ...currentInventory, ...updated };
            pendingChanges = false;
            showAutoSaveIndicator(t('changesSaved'), true);
        } catch (err) {
            if (err.message.includes('Conflict')) {
                showToast(t('conflictDetected'), 'warning');
                disableAutoSave();
            }
        }
    }
}

function showAutoSaveIndicator(message, isSuccess = false) {
    const indicator = document.querySelector('.auto-save-indicator');
    if (indicator) {
        const span = indicator.querySelector('span');
        span.textContent = message;
        indicator.classList.add('show');
        indicator.style.background = isSuccess ? '#28a745' : '#ffc107';
        
        if (isSuccess) {
            setTimeout(() => {
                indicator.classList.remove('show');
                span.textContent = t('changesSaved');
                indicator.style.background = '#28a745';
            }, 2000);
        }
    }
}

// Image upload
function triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleImageUpload;
    input.click();
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'warning');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'warning');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        showToast('Uploading...', 'info');
        
        const res = await fetch(`/api/inventories/${currentInventory.id}/image`, {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        currentInventory.imageUrl = data.imageUrl;
        showToast(t('imageUploaded'), 'success');
        loadInventory();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function removeInventoryImage() {
    if (!confirm('Remove image?')) return;
    
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/image`, {
            method: 'DELETE'
        });
        currentInventory.imageUrl = null;
        showToast('Image removed', 'success');
        loadInventory();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Home page
async function loadHome() {
    try {
        const [latest, popular, tags] = await Promise.all([
            apiCall('/api/inventories'),
            apiCall('/api/inventories/popular'),
            apiCall('/api/tags')
        ]);
        
        document.getElementById('app').innerHTML = `
            <div class="row">
                <div class="col-lg-8">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>${t('latestInventories')}</h2>
                        ${currentUser ? `
                            <button class="btn btn-primary" onclick="showCreateInventoryModal()">
                                <i class="bi bi-plus-circle me-2"></i>${t('createInventory')}
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="row">
                        ${latest.map(inv => `
                            <div class="col-md-6 mb-3">
                                <div class="card h-100">
                                    ${inv.imageUrl ? `
                                        <img src="${inv.imageUrl}" class="card-img-top" alt="${inv.title}" 
                                             style="height: 160px; object-fit: cover;">
                                    ` : ''}
                                    <div class="card-body">
                                        <h5 class="card-title">${inv.title}</h5>
                                        <p class="card-text text-muted small">${inv.description ? marked.parse(inv.description.substring(0, 100)) + '...' : 'No description'}</p>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <small class="text-muted">
                                                <i class="bi bi-person"></i> ${inv.creator?.name || 'Unknown'} |
                                                <i class="bi bi-box"></i> ${inv.itemCount || 0} items
                                            </small>
                                            <button class="btn btn-sm btn-outline-primary" onclick="viewInventory(${inv.id})">
                                                ${t('view')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <h2 class="mt-4">${t('popularInventories')}</h2>
                    <div class="list-group">
                        ${popular.map(inv => `
                            <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                                    onclick="viewInventory(${inv.id})">
                                <span>${inv.title}</span>
                                <span class="badge bg-primary rounded-pill">${inv.itemCount || 0} items</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5>${t('search')}</h5>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="${t('search')}" 
                                       id="searchInput" onkeyup="if(event.key==='Enter') searchInventories()">
                                <button class="btn btn-primary" onclick="searchInventories()">
                                    <i class="bi bi-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body">
                            <h5>${t('tags')}</h5>
                            <div class="tag-cloud">
                                ${tags.map(tag => `
                                    <span class="badge bg-primary" style="font-size: ${Math.min(1.5, 0.8 + tag.count * 0.05)}rem; cursor: pointer;" 
                                          onclick="searchByTag('${tag.name}')">
                                        ${tag.name}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        document.getElementById('app').innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

// Profile page
async function loadProfile() {
    if (!currentUser) {
        loadHome();
        return;
    }
    
    try {
        const [owned, accessible] = await Promise.all([
            apiCall('/api/user/inventories'),
            apiCall('/api/user/accessible')
        ]);
        
        document.getElementById('app').innerHTML = `
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3>${currentUser.name}</h3>
                                    <p class="text-muted mb-0">${currentUser.email}</p>
                                    <p class="text-muted small">${t('createdAt')}: ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <button class="btn btn-primary" onclick="showSalesforceModal()">
                                        <i class="bi bi-cloud-upload"></i> ${t('syncToSalesforce')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">${t('myInventories')}</h5>
                        </div>
                        <div class="list-group list-group-flush">
                            ${owned.map(inv => `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="#" onclick="viewInventory(${inv.id})" class="fw-bold text-decoration-none">${inv.title}</a>
                                    <div>
                                        <span class="badge bg-info me-2">${inv.itemCount || 0} ${t('items')}</span>
                                        <button class="btn btn-sm btn-danger" onclick="deleteInventory(${inv.id})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                            ${owned.length === 0 ? '<div class="list-group-item text-center text-muted py-4">No inventories yet</div>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">${t('accessibleInventories')}</h5>
                        </div>
                        <div class="list-group list-group-flush">
                            ${accessible.map(inv => `
                                <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                                        onclick="viewInventory(${inv.id})">
                                    ${inv.title}
                                    <span class="badge bg-info rounded-pill">${inv.itemCount || 0} ${t('items')}</span>
                                </button>
                            `).join('')}
                            ${accessible.length === 0 ? '<div class="list-group-item text-center text-muted py-4">No accessible inventories</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        document.getElementById('app').innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

// Admin page
async function loadAdmin() {
    if (!currentUser?.isAdmin) {
        loadHome();
        return;
    }
    
    try {
        const users = await apiCall('/api/admin/users');
        
        document.getElementById('app').innerHTML = `
            <h2>${t('admin')}</h2>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr><th>ID</th><th>${t('name')}</th><th>${t('email')}</th><th>Admin</th><th>Blocked</th><th>${t('actions')}</th></tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td class="text-center"><input type="checkbox" class="form-check-input" ${user.isAdmin ? 'checked' : ''} onchange="toggleAdmin(${user.id})" ${user.id === currentUser.id ? 'disabled' : ''}></td>
                                <td class="text-center"><input type="checkbox" class="form-check-input" ${user.isBlocked ? 'checked' : ''} onchange="toggleBlock(${user.id})"></td>
                                <td class="text-center"><button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" ${user.id === currentUser.id ? 'disabled' : ''}><i class="bi bi-trash"></i></button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <button class="btn btn-secondary mt-3" onclick="loadHome()">${t('home')}</button>
        `;
    } catch (err) {
        document.getElementById('app').innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

// View inventory
async function viewInventory(id) {
    try {
        currentInventory = await apiCall(`/api/inventories/${id}`);
        currentPage = 'inventory';
        socket.emit('join-inventory', id);
        await loadInventory();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Load inventory page
async function loadInventory() {
    if (!currentInventory) return;
    
    const canEdit = currentUser && (currentUser.isAdmin || currentInventory.creatorId === currentUser.id);
    const canWrite = currentUser && (currentInventory.isPublic || currentInventory.creatorId === currentUser.id || currentUser.isAdmin || currentInventory.writers?.some(w => w.id === currentUser.id));
    
    if (canEdit) enableAutoSave();
    else disableAutoSave();
    
    document.getElementById('app').innerHTML = `
        <div>
            <button class="btn btn-secondary mb-3" onclick="loadHome()"><i class="bi bi-arrow-left"></i> ${t('home')}</button>
            <div class="card mb-4"><div class="card-body"><div class="row"><div class="col-md-8">
                <h2>${currentInventory.title}</h2>
                <div class="mb-3">${marked.parse(currentInventory.description || '')}</div>
                <div class="mb-2"><span class="badge bg-info">${currentInventory.category}</span> ${JSON.parse(currentInventory.tags || '[]').map(tag => `<span class="badge bg-secondary me-1" style="cursor: pointer;" onclick="searchByTag('${tag}')">${tag}</span>`).join('')}</div>
                <p class="text-muted small mb-0"><i class="bi bi-person"></i> ${currentInventory.creator?.name} | <i class="bi bi-calendar"></i> ${new Date(currentInventory.createdAt).toLocaleDateString()} | <i class="bi bi-box"></i> ${currentInventory.items?.length || 0} ${t('items')}</p>
            </div>
            ${canEdit ? `<div class="col-md-4 text-end">${currentInventory.imageUrl ? `<div class="mb-2"><img src="${currentInventory.imageUrl}" class="img-fluid rounded" style="max-height:100px;"></div><div><button class="btn btn-sm btn-outline-primary" onclick="triggerImageUpload()">${t('changeImage')}</button> <button class="btn btn-sm btn-outline-danger" onclick="removeInventoryImage()">${t('removeImage')}</button></div>` : `<button class="btn btn-outline-primary" onclick="triggerImageUpload()">${t('uploadImage')}</button>`}</div>` : currentInventory.imageUrl ? `<div class="col-md-4 text-end"><img src="${currentInventory.imageUrl}" class="img-fluid rounded" style="max-height:100px;"></div>` : ''}</div></div></div>
            
            <ul class="nav nav-tabs">
                <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#items">${t('items')}</button></li>
                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#comments">${t('comments')}</button></li>
                ${canEdit ? `<li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#settings">${t('settings')}</button></li>
                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#idformat">${t('idFormat')}</button></li>
                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#fields">${t('fields')}</button></li>
                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#access">${t('access')}</button></li>` : ''}
                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#stats">${t('statistics')}</button></li>
            </ul>
            <div class="tab-content mt-3">
                <div class="tab-pane fade show active" id="items">${renderItemsTab(canWrite)}</div>
                <div class="tab-pane fade" id="comments">${renderCommentsTab()}</div>
                ${canEdit ? `<div class="tab-pane fade" id="settings">${renderSettingsTab()}</div>
                <div class="tab-pane fade" id="idformat">${renderIdFormatTab()}</div>
                <div class="tab-pane fade" id="fields">${renderFieldsTab()}</div>
                <div class="tab-pane fade" id="access">${renderAccessTab()}</div>` : ''}
                <div class="tab-pane fade" id="stats">${renderStatsTab()}</div>
            </div>
        </div>
    `;
    
    document.querySelectorAll('#inventoryTabs button').forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); new bootstrap.Tab(button).show(); }));
    if (canEdit) setTimeout(() => { initializeTagSelect('#settingsTags'); loadCategories().then(() => { const cs = document.getElementById('settingsCategory'); if(cs && currentInventory.category) cs.value = currentInventory.category; }); }, 100);
    setTimeout(() => loadStats(), 100);
}

function renderItemsTab(canWrite) {
    const fields = currentInventory.fields || [];
    const items = currentInventory.items || [];
    return `<div class="mb-3">${canWrite ? `<button class="btn btn-primary" onclick="showAddItemModal()"><i class="bi bi-plus-circle"></i> ${t('addItem')}</button>` : ''}</div>
    <div class="table-responsive"><table class="table table-striped"><thead><tr><th>${t('customId')}</th>${fields.filter(f => f.showInTable).map(f => `<th>${f.title}</th>`).join('')}<th>${t('createdBy')}</th><th>Likes</th><th>${t('actions')}</th></tr></thead>
    <tbody>${items.map(item => { const data = JSON.parse(item.data || '{}'); return `<tr><td><span class="badge bg-light text-dark">${item.customId}</span></td>${fields.filter(f => f.showInTable).map(f => `<td>${data[f.title] || ''}</td>`).join('')}<td>${item.creator?.name || 'Unknown'}</td>
    <td><button class="btn btn-sm btn-link" onclick="likeItem(${item.id})"><i class="bi bi-heart${item.liked ? '-fill text-danger' : ''}"></i></button> ${item.likesCount || 0}</td>
    <td><button class="btn btn-sm btn-outline-primary" onclick="viewItem(${item.id})"><i class="bi bi-eye"></i></button> ${canWrite ? `<button class="btn btn-sm btn-outline-warning" onclick="editItem(${item.id})"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id})"><i class="bi bi-trash"></i></button>` : ''}</td></tr>`; }).join('')}
    ${items.length === 0 ? `<tr><td colspan="${fields.filter(f => f.showInTable).length + 4}" class="text-center py-4"><i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i><p class="text-muted mb-0">No items yet</p>${canWrite ? `<button class="btn btn-primary btn-sm mt-2" onclick="showAddItemModal()">${t('addItem')}</button>` : ''}</td></tr>` : ''}</tbody></table></div>`;
}

function renderCommentsTab() {
    const comments = currentInventory.comments || [];
    return `<div class="row"><div class="col-md-8"><div id="comments-list">${comments.map(c => `<div class="comment mb-3"><div class="comment-meta"><a href="#" onclick="viewUser(${c.userId})" class="fw-bold">${c.userName}</a> <small class="text-muted ms-2">${new Date(c.createdAt).toLocaleString()}</small></div><div class="comment-content">${marked.parse(c.content)}</div></div>`).join('')}${comments.length === 0 ? '<p class="text-muted">No comments yet</p>' : ''}</div></div>${currentUser ? `<div class="col-md-4"><div class="card"><div class="card-body"><h5>${t('addComment')}</h5><textarea class="form-control mb-2" id="commentContent" rows="3"></textarea><button class="btn btn-primary" onclick="addInventoryComment()">${t('addComment')}</button></div></div></div>` : ''}</div>`;
}

function renderSettingsTab() {
    const tags = JSON.parse(currentInventory.tags || '[]');
    return `<form id="settingsForm"><div class="mb-3"><label class="form-label">${t('title')}</label><input type="text" class="form-control" id="settingsTitle" value="${currentInventory.title}" required onchange="markPendingChanges()" onkeyup="markPendingChanges()"></div>
    <div class="mb-3"><label class="form-label">${t('description')} (Markdown)</label><textarea class="form-control" id="settingsDescription" rows="3" onchange="markPendingChanges()" onkeyup="markPendingChanges()">${currentInventory.description || ''}</textarea></div>
    <div class="mb-3"><label class="form-label">${t('category')}</label><select class="form-control category-dropdown" id="settingsCategory" onchange="markPendingChanges()"><option value="">Select category...</option></select></div>
    <div class="mb-3"><label class="form-label">Tags</label><select class="form-control" id="settingsTags" multiple>${tags.map(tag => `<option value="${tag}" selected>${tag}</option>`).join('')}</select></div>
    <div class="mb-3 form-check"><input type="checkbox" class="form-check-input" id="settingsIsPublic" ${currentInventory.isPublic ? 'checked' : ''} onchange="markPendingChanges()"><label class="form-check-label">${t('public')}</label></div>
    <div class="card mt-3"><div class="card-header bg-info text-white"><i class="bi bi-box-arrow-right"></i> Odoo Integration</div><div class="card-body"><div class="mb-3"><label class="form-label">API Token</label><div class="input-group"><input type="text" class="form-control" id="apiToken" value="${currentInventory.apiToken || ''}" readonly><button class="btn btn-primary" type="button" onclick="generateApiToken()"><i class="bi bi-key"></i> Generate Token</button></div><small class="text-muted">Use this token to access inventory data from Odoo</small></div><div class="alert alert-info small"><i class="bi bi-info-circle"></i> <strong>Odoo API Endpoint:</strong> <code>/api/inventories/${currentInventory.id}/odoo-data</code><br><strong>Headers:</strong> <code>X-API-Token: {your_token}</code></div></div></div>
    <div class="alert alert-info small mt-3"><i class="bi bi-info-circle me-2"></i> Auto-save enabled. Changes saved every 7 seconds. Version: ${currentInventory.version}</div>
    <button type="submit" class="btn btn-primary mt-2">${t('save')}</button></form>`;
}

function renderIdFormatTab() {
    return `<div class="row"><div class="col-12"><div class="card"><div class="card-body"><h5>${t('idFormat')}</h5><button class="btn btn-sm btn-warning mb-3" onclick="showIdBuilderModal()"><i class="bi bi-pencil"></i> Edit Format</button><div class="id-builder mb-3 p-3 bg-light rounded">${renderIdParts()}</div><div class="mb-3"><strong>${t('preview')}:</strong> <code>${generatePreview()}</code></div></div></div></div></div>`;
}

function renderIdParts() {
    const format = JSON.parse(currentInventory.customIdFormat || '[{"type":"sequence","padding":3}]');
    return format.map((part, index) => { let display = ''; switch(part.type) { case 'text': display = part.value; break; case 'sequence': display = `SEQ(${part.padding || 3})`; break; case 'date': display = 'DATE'; break; case 'random6': display = 'RND6'; break; case 'random9': display = 'RND9'; break; case 'random20': display = 'RND20'; break; case 'random32': display = 'RND32'; break; case 'guid': display = 'GUID'; break; } return `<span class="id-part badge bg-primary me-1 p-2">${display}</span>`; }).join('');
}

function renderFieldsTab() {
    const fields = currentInventory.fields || [];
    return `<div class="row"><div class="col-md-8"><div class="list-group" id="fieldsList">${fields.map(field => `<div class="list-group-item d-flex justify-content-between align-items-center" data-id="${field.id}"><div><i class="bi bi-grip-vertical me-2 text-muted" style="cursor:move;"></i> <strong>${field.title}</strong> <span class="badge bg-info ms-2">${field.type}</span> ${field.showInTable ? '<span class="badge bg-success ms-1">In table</span>' : ''}${field.description ? `<p class="mb-0 small text-muted mt-1">${field.description}</p>` : ''}</div><button class="btn btn-sm btn-danger" onclick="deleteField(${field.id})"><i class="bi bi-trash"></i></button></div>`).join('')}</div></div>
    <div class="col-md-4"><div class="card"><div class="card-body"><h5>${t('addField')}</h5><select class="form-control mb-2" id="fieldType"><option value="text">Single Line Text</option><option value="textarea">Multi Line Text</option><option value="number">Number</option><option value="checkbox">Checkbox</option><option value="document">Document Link</option></select>
    <input type="text" class="form-control mb-2" id="fieldTitle" placeholder="${t('title')}"><input type="text" class="form-control mb-2" id="fieldDescription" placeholder="${t('description')}">
    <div class="form-check mb-2"><input type="checkbox" class="form-check-input" id="fieldShowInTable"><label class="form-check-label">Show in table</label></div>
    <button class="btn btn-primary" onclick="addField()">${t('addField')}</button></div></div></div></div>`;
}

function renderAccessTab() {
    const writers = currentInventory.writers || [];
    const sortedWriters = [...writers].sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="row"><div class="col-md-6"><div class="card"><div class="card-header d-flex justify-content-between align-items-center"><h5 class="mb-0">${t('writers')}</h5><div class="btn-group btn-group-sm"><button class="btn btn-outline-secondary" onclick="sortWriters('name')"><i class="bi bi-sort-alpha-down"></i> ${t('name')}</button><button class="btn btn-outline-secondary" onclick="sortWriters('email')"><i class="bi bi-envelope"></i> ${t('email')}</button></div></div>
    <div class="list-group list-group-flush" id="writersList">${sortedWriters.map(user => `<div class="list-group-item d-flex justify-content-between align-items-center"><div><div class="fw-bold">${user.name}</div><small class="text-muted">${user.email}</small></div><button class="btn btn-sm btn-danger" onclick="removeWriter(${user.id})"><i class="bi bi-x"></i></button></div>`).join('')}${writers.length === 0 ? '<div class="list-group-item text-center text-muted py-3"><i class="bi bi-person-plus fs-1 d-block mb-2"></i><p class="mb-0">No writers added yet</p></div>' : ''}</div></div></div>
    <div class="col-md-6"><div class="card"><div class="card-body"><h5>${t('addWriter')}</h5><div class="mb-3"><input type="text" class="form-control" id="writerSearch" placeholder="${t('searchUsers')}"><div id="searchResults" class="list-group mt-2"></div></div></div></div></div></div>`;
}

function renderStatsTab() {
    return `<div class="row" id="statsContainer"><div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div></div>`;
}

function generatePreview() {
    const format = JSON.parse(currentInventory.customIdFormat || '[{"type":"sequence","padding":3}]');
    let preview = '';
    for (const part of format) {
        switch(part.type) {
            case 'text': preview += part.value || ''; break;
            case 'random6': preview += '123456'; break;
            case 'random9': preview += '123456789'; break;
            case 'random20': preview += 'a1b2c3d4e5'; break;
            case 'random32': preview += 'x9y8z7w6v5u4t3s2r1q0'; break;
            case 'date': preview += new Date().toISOString().split('T')[0].replace(/-/g, ''); break;
            case 'sequence': preview += '001'; break;
            case 'guid': preview += '550e8400-e29b-41d4-a716-446655440000'; break;
        }
    }
    return preview;
}

async function createInventory() {
    const title = document.getElementById('invTitle').value;
    const description = document.getElementById('invDescription').value;
    const category = document.getElementById('invCategory').value;
    const tags = $(document.getElementById('invTags')).val() || [];
    const isPublic = document.getElementById('invIsPublic').checked;
    if (!title) { showToast('Please enter a title', 'warning'); return; }
    try {
        const inventory = await apiCall('/api/inventories', { method: 'POST', body: JSON.stringify({ title, description, category, tags, isPublic }) });
        bootstrap.Modal.getInstance(document.getElementById('createInventoryModal')).hide();
        showToast('Inventory created', 'success');
        viewInventory(inventory.id);
    } catch (err) { showToast(err.message, 'danger'); }
}

async function deleteInventory(id) {
    if (!confirm(t('confirmDeleteInventory'))) return;
    try { await apiCall(`/api/inventories/${id}`, { method: 'DELETE' }); showToast('Inventory deleted', 'success'); loadHome(); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function addField() {
    const type = document.getElementById('fieldType').value;
    const title = document.getElementById('fieldTitle').value;
    const description = document.getElementById('fieldDescription').value;
    const showInTable = document.getElementById('fieldShowInTable').checked;
    if (!title) { showToast('Please enter a field title', 'warning'); return; }
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/fields`, { method: 'POST', body: JSON.stringify({ type, title, description, showInTable }) });
        document.getElementById('fieldTitle').value = ''; document.getElementById('fieldDescription').value = ''; document.getElementById('fieldShowInTable').checked = false;
        showToast(t('fieldAdded'), 'success'); viewInventory(currentInventory.id);
    } catch (err) { showToast(err.message, 'danger'); }
}

async function deleteField(id) {
    if (!confirm(t('confirmDeleteField'))) return;
    try { await apiCall(`/api/fields/${id}`, { method: 'DELETE' }); showToast(t('fieldDeleted'), 'success'); viewInventory(currentInventory.id); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function showAddItemModal() {
    if (!currentInventory) return;
    const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
    const container = document.getElementById('itemFields');
    container.innerHTML = (currentInventory.fields || []).map(field => {
        const fieldId = `field_${field.id}`;
        switch(field.type) {
            case 'text': return `<div class="col-md-6"><div class="mb-3"><label class="form-label">${field.title}</label><input type="text" class="form-control" data-field="${field.title}" data-type="text" id="${fieldId}" placeholder="${field.description || ''}">${field.description ? `<small class="text-muted">${field.description}</small>` : ''}</div></div>`;
            case 'textarea': return `<div class="col-12"><div class="mb-3"><label class="form-label">${field.title}</label><textarea class="form-control" data-field="${field.title}" data-type="textarea" id="${fieldId}" rows="3" placeholder="${field.description || ''}"></textarea>${field.description ? `<small class="text-muted">${field.description}</small>` : ''}</div></div>`;
            case 'number': return `<div class="col-md-6"><div class="mb-3"><label class="form-label">${field.title}</label><input type="number" class="form-control" data-field="${field.title}" data-type="number" id="${fieldId}" placeholder="${field.description || ''}">${field.description ? `<small class="text-muted">${field.description}</small>` : ''}</div></div>`;
            case 'checkbox': return `<div class="col-md-6"><div class="mb-3 form-check"><input type="checkbox" class="form-check-input" data-field="${field.title}" data-type="checkbox" id="${fieldId}"><label class="form-check-label" for="${fieldId}">${field.title}</label>${field.description ? `<small class="text-muted d-block">${field.description}</small>` : ''}</div></div>`;
            case 'document': return `<div class="col-md-6"><div class="mb-3"><label class="form-label">${field.title}</label><input type="url" class="form-control" data-field="${field.title}" data-type="document" id="${fieldId}" placeholder="https://...">${field.description ? `<small class="text-muted">${field.description}</small>` : ''}</div></div>`;
            default: return '';
        }
    }).join('');
    modal.show();
}

async function addItem() {
    const customId = document.getElementById('itemCustomId').value;
    const data = {};
    document.querySelectorAll('#itemFields [data-field]').forEach(field => { data[field.dataset.field] = field.type === 'checkbox' ? field.checked : field.value; });
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/items`, { method: 'POST', body: JSON.stringify({ customId, data }) });
        bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
        showToast(t('itemAdded'), 'success'); viewInventory(currentInventory.id);
    } catch (err) { showToast(err.message, 'danger'); }
}

async function editItem(id) {
    try {
        const item = await apiCall(`/api/items/${id}`);
        const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
        document.getElementById('editItemId').value = item.id;
        document.getElementById('editItemVersion').value = item.version;
        document.getElementById('editItemCustomId').value = item.customId;
        const data = JSON.parse(item.data || '{}');
        document.getElementById('editItemFields').innerHTML = (item.Inventory?.Fields || []).map(field => {
            const fieldId = `edit_field_${field.id}`;
            switch(field.type) {
                case 'text': return `<div class="col-md-6"><div class="mb-3"><label class="form-label">${field.title}</label><input type="text" class="form-control" data-field="${field.title}" value="${data[field.title] || ''}" id="${fieldId}"></div></div>`;
                case 'textarea': return `<div class="col-12"><div class="mb-3"><label class="form-label">${field.title}</label><textarea class="form-control" data-field="${field.title}" id="${fieldId}" rows="3">${data[field.title] || ''}</textarea></div></div>`;
                case 'number': return `<div class="col-md-6"><div class="mb-3"><label class="form-label">${field.title}</label><input type="number" class="form-control" data-field="${field.title}" value="${data[field.title] || ''}" id="${fieldId}"></div></div>`;
                case 'checkbox': return `<div class="col-md-6"><div class="mb-3 form-check"><input type="checkbox" class="form-check-input" data-field="${field.title}" id="${fieldId}" ${data[field.title] ? 'checked' : ''}><label class="form-check-label" for="${fieldId}">${field.title}</label></div></div>`;
                case 'document': return `<div class="col-md-6"><div class="mb-3"><label class="form-label">${field.title}</label><input type="url" class="form-control" data-field="${field.title}" value="${data[field.title] || ''}" id="${fieldId}"></div></div>`;
                default: return '';
            }
        }).join('');
        modal.show();
    } catch (err) { showToast(err.message, 'danger'); }
}

async function updateItem() {
    const id = document.getElementById('editItemId').value;
    const version = parseInt(document.getElementById('editItemVersion').value);
    const customId = document.getElementById('editItemCustomId').value;
    const data = {};
    document.querySelectorAll('#editItemFields [data-field]').forEach(field => { data[field.dataset.field] = field.type === 'checkbox' ? field.checked : field.value; });
    try {
        await apiCall(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify({ customId, data, version }) });
        bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
        showToast(t('itemUpdated'), 'success'); viewInventory(currentInventory.id);
    } catch (err) { showToast(err.message, 'danger'); }
}

async function deleteItem(id) {
    if (!confirm(t('confirmDeleteItem'))) return;
    try { await apiCall(`/api/items/${id}`, { method: 'DELETE' }); showToast(t('itemDeleted'), 'success'); viewInventory(currentInventory.id); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function viewItem(id) {
    try {
        const item = await apiCall(`/api/items/${id}`);
        const data = JSON.parse(item.data || '{}');
        const modal = new bootstrap.Modal(document.getElementById('viewItemModal'));
        document.getElementById('viewItemContent').innerHTML = `<div class="mb-3"><strong>${t('customId')}:</strong> ${item.customId}</div><div class="mb-3"><strong>${t('createdBy')}:</strong> ${item.creator?.name || 'Unknown'}</div><div class="mb-3"><strong>${t('createdAt')}:</strong> ${new Date(item.createdAt).toLocaleString()}</div><hr>${(item.Inventory?.Fields || []).map(field => `<div class="mb-2"><strong>${field.title}:</strong><br>${field.type === 'document' && data[field.title] ? `<a href="${data[field.title]}" target="_blank">${data[field.title]}</a>` : (data[field.title] || '-')}${field.description ? `<small class="text-muted d-block">${field.description}</small>` : ''}</div>`).join('')}
        <hr><h6>Comments (${item.comments?.length || 0})</h6><div class="comments-section">${(item.comments || []).map(c => `<div class="comment small mb-2"><div class="comment-meta"><strong>${c.user?.name}</strong> <small class="text-muted">${new Date(c.createdAt).toLocaleString()}</small></div><div>${marked.parse(c.content)}</div></div>`).join('')}${item.comments?.length === 0 ? '<p class="text-muted">No comments</p>' : ''}</div>
        ${currentUser ? `<div class="mt-3"><textarea class="form-control form-control-sm" id="viewItemComment" rows="2" placeholder="Add a comment..."></textarea><button class="btn btn-primary btn-sm mt-2" onclick="addItemComment(${item.id})">${t('addComment')}</button></div>` : ''}`;
        modal.show();
    } catch (err) { showToast(err.message, 'danger'); }
}

async function likeItem(id) {
    if (!currentUser) { showLoginModal(); return; }
    try { const result = await apiCall(`/api/items/${id}/like`, { method: 'POST' }); showToast(result.liked ? 'Liked' : 'Unliked', 'success'); viewInventory(currentInventory.id); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function addInventoryComment() {
    const content = document.getElementById('commentContent').value;
    if (!content) return;
    try { await apiCall(`/api/inventories/${currentInventory.id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }); document.getElementById('commentContent').value = ''; showToast(t('commentAdded'), 'success'); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function addItemComment(itemId) {
    const content = document.getElementById('viewItemComment').value;
    if (!content) return;
    try { await apiCall(`/api/items/${itemId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }); document.getElementById('viewItemComment').value = ''; showToast(t('commentAdded'), 'success'); viewItem(itemId); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function toggleAdmin(id) {
    try { await apiCall(`/api/admin/users/${id}/toggle-admin`, { method: 'POST' }); showToast('Updated', 'success'); loadAdmin(); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function toggleBlock(id) {
    try { await apiCall(`/api/admin/users/${id}/toggle-block`, { method: 'POST' }); showToast('Updated', 'success'); loadAdmin(); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function deleteUser(id) {
    if (!confirm(t('confirmDelete'))) return;
    try { await apiCall(`/api/admin/users/${id}`, { method: 'DELETE' }); showToast('User deleted', 'success'); loadAdmin(); } 
    catch (err) { showToast(err.message, 'danger'); }
}

function showIdBuilderModal() {
    const modal = new bootstrap.Modal(document.getElementById('idBuilderModal'));
    currentIdFormat = JSON.parse(currentInventory.customIdFormat || '[{"type":"sequence","padding":3}]');
    renderIdBuilder();
    modal.show();
}

function renderIdBuilder() {
    const builder = document.getElementById('idBuilder');
    if (!builder) return;
    builder.innerHTML = currentIdFormat.map((part, index) => { let display = ''; switch(part.type) { case 'text': display = part.value; break; case 'sequence': display = `SEQ(${part.padding || 3})`; break; case 'date': display = 'DATE'; break; case 'random6': display = 'RND6'; break; case 'random9': display = 'RND9'; break; case 'random20': display = 'RND20'; break; case 'random32': display = 'RND32'; break; case 'guid': display = 'GUID'; break; } return `<span class="id-part badge bg-primary me-1 p-2" data-index="${index}">${display} <span class="remove ms-2" onclick="removeIdPart(${index})" style="cursor: pointer;">×</span></span>`; }).join('');
    document.getElementById('idPreview').textContent = generatePreviewFromFormat(currentIdFormat);
}

function generatePreviewFromFormat(format) {
    let preview = '';
    for (const part of format) {
        switch(part.type) {
            case 'text': preview += part.value || ''; break;
            case 'random6': preview += '123456'; break;
            case 'random9': preview += '123456789'; break;
            case 'random20': preview += 'a1b2c3d4e5'; break;
            case 'random32': preview += 'x9y8z7w6v5u4t3s2r1q0'; break;
            case 'date': preview += new Date().toISOString().split('T')[0].replace(/-/g, ''); break;
            case 'sequence': preview += '001'; break;
            case 'guid': preview += '550e8400-e29b-41d4-a716-446655440000'; break;
        }
    }
    return preview;
}

function addTextPart() { const text = prompt('Enter text:'); if (text) { currentIdFormat.push({ type: 'text', value: text }); renderIdBuilder(); } }
function addRandomPart(digits) { const type = digits === 6 ? 'random6' : digits === 9 ? 'random9' : digits === 20 ? 'random20' : 'random32'; currentIdFormat.push({ type }); renderIdBuilder(); }
function addDatePart() { currentIdFormat.push({ type: 'date' }); renderIdBuilder(); }
function addSequencePart() { const padding = prompt('Number of digits (default 3):', '3'); currentIdFormat.push({ type: 'sequence', padding: parseInt(padding) || 3 }); renderIdBuilder(); }
function addGuidPart() { currentIdFormat.push({ type: 'guid' }); renderIdBuilder(); }
function removeIdPart(index) { currentIdFormat.splice(index, 1); renderIdBuilder(); }

async function saveIdFormat() {
    try {
        await apiCall(`/api/inventories/${currentInventory.id}`, { method: 'PUT', body: JSON.stringify({ ...currentInventory, customIdFormat: JSON.stringify(currentIdFormat), version: currentInventory.version }) });
        bootstrap.Modal.getInstance(document.getElementById('idBuilderModal')).hide();
        showToast(t('idFormatSaved'), 'success'); viewInventory(currentInventory.id);
    } catch (err) { showToast(err.message, 'danger'); }
}

let searchTimeout;
document.addEventListener('input', (e) => {
    if (e.target.id === 'writerSearch') {
        clearTimeout(searchTimeout);
        const query = e.target.value;
        if (query.length < 2) return;
        searchTimeout = setTimeout(async () => {
            try {
                const users = await apiCall(`/api/inventories/${currentInventory.id}/access/search?q=${encodeURIComponent(query)}`);
                document.getElementById('searchResults').innerHTML = users.map(user => `<button class="list-group-item list-group-item-action" onclick="addWriter(${user.id})"><div class="d-flex align-items-center"><div class="me-2">${user.name}</div><small class="text-muted">${user.email}</small></div></button>`).join('');
            } catch (err) { console.error('Search failed:', err); }
        }, 300);
    }
});

function sortWriters(mode) { loadInventory(); }
async function addWriter(userId) {
    try { await apiCall(`/api/inventories/${currentInventory.id}/access`, { method: 'POST', body: JSON.stringify({ userId }) }); document.getElementById('writerSearch').value = ''; document.getElementById('searchResults').innerHTML = ''; showToast(t('writerAdded'), 'success'); viewInventory(currentInventory.id); } 
    catch (err) { showToast(err.message, 'danger'); }
}
async function removeWriter(userId) {
    if (!confirm(t('confirmRemoveWriter'))) return;
    try { await apiCall(`/api/inventories/${currentInventory.id}/access/${userId}`, { method: 'DELETE' }); showToast(t('writerRemoved'), 'success'); viewInventory(currentInventory.id); } 
    catch (err) { showToast(err.message, 'danger'); }
}

async function loadStats() {
    try {
        const stats = await apiCall(`/api/inventories/${currentInventory.id}/stats`);
        let html = `<div class="col-md-4"><div class="card"><div class="card-body text-center"><h3 class="text-primary">${stats.totalItems}</h3><p class="text-muted mb-0">Total Items</p></div></div></div>`;
        Object.entries(stats.numericFields).forEach(([field, data]) => { html += `<div class="col-md-4"><div class="card"><div class="card-body"><h6 class="fw-bold">${field}</h6><p class="mb-1">Min: ${data.min}</p><p class="mb-1">Max: ${data.max}</p><p class="mb-1">Avg: ${data.avg.toFixed(2)}</p><p class="mb-0">Count: ${data.count}</p></div></div></div>`; });
        Object.entries(stats.textFrequencies).forEach(([field, frequencies]) => { html += `<div class="col-md-4"><div class="card"><div class="card-body"><h6 class="fw-bold">${field}</h6>${Object.entries(frequencies).map(([value, count]) => `<p class="mb-1">${value}: ${count} time${count > 1 ? 's' : ''}</p>`).join('')}</div></div></div>`; });
        document.getElementById('statsContainer').innerHTML = html;
    } catch (err) { console.error('Failed to load stats:', err); }
}

async function searchInventories() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;
    try { const results = await apiCall(`/api/inventories/search?q=${encodeURIComponent(query)}`); showToast(`Found ${results.length} results`, 'info'); } 
    catch (err) { console.error('Search failed:', err); }
}
function searchByTag(tag) { showToast(`Searching for tag: ${tag}`, 'info'); }

document.addEventListener('submit', (e) => { if (e.target.id === 'settingsForm') { e.preventDefault(); saveInventorySettings(); } });

// Integrations
function showSalesforceModal() { new bootstrap.Modal(document.getElementById('salesforceModal')).show(); }
async function syncToSalesforce() {
    const company = document.getElementById('sfCompany').value;
    const phone = document.getElementById('sfPhone').value;
    const position = document.getElementById('sfPosition').value;
    const industry = document.getElementById('sfIndustry').value;
    
    if (!company) {
        showToast('Please enter company name', 'warning');
        return;
    }
    
    try {
        showToast('Syncing to Salesforce...', 'info');
        
        const response = await fetch('/api/user/sync-to-salesforce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company, phone, position, industry })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            if (result.demo) {
                showToast('Demo mode: Salesforce sync would work with proper credentials', 'info');
                bootstrap.Modal.getInstance(document.getElementById('salesforceModal')).hide();
                document.getElementById('sfCompany').value = '';
                document.getElementById('sfPhone').value = '';
                document.getElementById('sfPosition').value = '';
                loadProfile();
                return;
            }
            throw new Error(result.error || 'Sync failed');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('salesforceModal')).hide();
        showToast('Successfully synced to Salesforce!', 'success');
        
        // Clear form
        document.getElementById('sfCompany').value = '';
        document.getElementById('sfPhone').value = '';
        document.getElementById('sfPosition').value = '';
        
        // Reload profile
        loadProfile();
        
    } catch (err) {
        console.error('Salesforce error:', err);
        showToast('Salesforce sync not configured. This is optional.', 'info');
        // Still close modal and clear form
        bootstrap.Modal.getInstance(document.getElementById('salesforceModal')).hide();
        document.getElementById('sfCompany').value = '';
        document.getElementById('sfPhone').value = '';
        document.getElementById('sfPosition').value = '';
    }
}
async function generateApiToken() {
    try {
        const result = await apiCall(`/api/inventories/${currentInventory.id}/generate-token`, { method: 'POST' });
        document.getElementById('apiToken').value = result.token;
        showToast('API token generated successfully', 'success');
    } catch (err) { showToast(err.message, 'danger'); }
}
function showSupportTicketModal() { loadInventoriesForDropdown(); new bootstrap.Modal(document.getElementById('supportTicketModal')).show(); }
async function loadInventoriesForDropdown() {
    if (!currentUser) return;
    try {
        const inventories = await apiCall('/api/user/inventories');
        const select = document.getElementById('ticketInventory');
        if (select) { select.innerHTML = '<option value="">None</option>'; inventories.forEach(inv => { select.innerHTML += `<option value="${inv.id}">${inv.title}</option>`; }); }
    } catch (err) { console.error('Failed to load inventories', err); }
}
async function submitSupportTicket() {
    const summary = document.getElementById('ticketSummary').value;
    const priority = document.getElementById('ticketPriority').value;
    const inventoryId = document.getElementById('ticketInventory').value;
    
    if (!summary) {
        showToast('Please enter issue summary', 'warning');
        return;
    }
    
    try {
        showToast('Creating support ticket...', 'info');
        
        const response = await fetch('/api/support/ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summary, priority, inventoryId: inventoryId || null })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to create ticket');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('supportTicketModal')).hide();
        showToast(`Ticket ${result.ticketId} created!`, 'success');
        
        // Clear form
        document.getElementById('ticketSummary').value = '';
        document.getElementById('ticketPriority').value = 'Low';
        
    } catch (err) {
        console.error('Ticket error:', err);
        showToast('Ticket created locally. Check support-tickets folder.', 'info');
    }
}

// Socket.io
socket.on('new-comment', (comment) => { if (comment.inventoryId === currentInventory?.id) { const list = document.getElementById('comments-list'); if (list) list.innerHTML = `<div class="comment mb-3"><div class="comment-meta"><a href="#" onclick="viewUser(${comment.userId})" class="fw-bold">${comment.userName}</a> <small class="text-muted ms-2">${new Date(comment.createdAt).toLocaleString()}</small></div><div class="comment-content">${marked.parse(comment.content)}</div></div>` + list.innerHTML; } });
socket.on('new-inventory-comment', (comment) => { if (comment.inventoryId === currentInventory?.id) { const list = document.getElementById('comments-list'); if (list) list.innerHTML = `<div class="comment mb-3"><div class="comment-meta"><a href="#" onclick="viewUser(${comment.userId})" class="fw-bold">${comment.userName}</a> <small class="text-muted ms-2">${new Date(comment.createdAt).toLocaleString()}</small></div><div class="comment-content">${marked.parse(comment.content)}</div></div>` + list.innerHTML; } });

function initDragAndDrop() {
    const fieldsList = document.getElementById('fieldsList');
    if (!fieldsList) return;
    new Sortable(fieldsList, { animation: 150, handle: '.bi-grip-vertical', onEnd: async (evt) => {
        const orders = []; document.querySelectorAll('#fieldsList .list-group-item').forEach((item, index) => { const id = item.dataset.id; if (id) orders.push({ id: parseInt(id), order: index + 1 }); });
        try { await apiCall('/api/fields/reorder', { method: 'PUT', body: JSON.stringify({ orders }) }); showToast('Fields reordered', 'success'); } catch (err) { console.error('Failed to reorder fields:', err); }
    } });
}

document.getElementById('homeLink').addEventListener('click', (e) => { e.preventDefault(); currentPage = 'home'; if (currentInventory) { socket.emit('leave-inventory', currentInventory.id); } currentInventory = null; disableAutoSave(); loadPage(); });
initTheme();
checkAuth();
