// State
let currentUser = null;
let currentPage = 'home';
let currentInventory = null;
let currentItem = null;
let currentIdFormat = [];
let socket = io();
let autoSaveTimer = null;
let pendingChanges = false;

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
        loginWithGoogle: 'Login with Google',
        loginWithFacebook: 'Login with Facebook',
        uploadImage: 'Upload Image',
        changeImage: 'Change Image',
        removeImage: 'Remove Image',
        dropImageHere: 'Drop image here or click to upload',
        searchUsers: 'Search users by name or email...',
        noResults: 'No results found',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        confirm: 'Confirm',
        actions: 'Actions',
        createdAt: 'Created At',
        createdBy: 'Created By',
        version: 'Version',
        conflict: 'Conflict detected. Please refresh and try again.',
        duplicateCustomId: 'This Custom ID already exists in this inventory.',
        invalidCustomId: 'Invalid Custom ID format.',
        dragAndDrop: 'Drag and drop to reorder',
        clickToRemove: 'Click to remove',
        fieldType: 'Field Type',
        fieldTitle: 'Field Title',
        fieldDescription: 'Field Description',
        showInTable: 'Show in table',
        add: 'Add',
        update: 'Update',
        close: 'Close',
        confirmDeleteInventory: 'Are you sure you want to delete this inventory? This action cannot be undone.',
        confirmDeleteItem: 'Are you sure you want to delete this item?',
        confirmDeleteField: 'Are you sure you want to delete this field?',
        confirmRemoveWriter: 'Are you sure you want to remove this writer?',
        settingsSaved: 'Settings saved successfully',
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
        autoSave: 'Auto-saved',
        refresh: 'Refresh',
        retry: 'Retry'
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
        loginWithGoogle: 'Iniciar sesión con Google',
        loginWithFacebook: 'Iniciar sesión con Facebook',
        uploadImage: 'Subir imagen',
        changeImage: 'Cambiar imagen',
        removeImage: 'Eliminar imagen',
        dropImageHere: 'Arrastra imagen o haz clic para subir',
        searchUsers: 'Buscar usuarios por nombre o email...',
        noResults: 'No se encontraron resultados',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información',
        confirm: 'Confirmar',
        actions: 'Acciones',
        createdAt: 'Creado el',
        createdBy: 'Creado por',
        version: 'Versión',
        conflict: 'Conflicto detectado. Por favor refresca y intenta de nuevo.',
        duplicateCustomId: 'Este ID personalizado ya existe en este inventario.',
        invalidCustomId: 'Formato de ID personalizado inválido.',
        dragAndDrop: 'Arrastra y suelta para reordenar',
        clickToRemove: 'Haz clic para eliminar',
        fieldType: 'Tipo de campo',
        fieldTitle: 'Título del campo',
        fieldDescription: 'Descripción del campo',
        showInTable: 'Mostrar en tabla',
        add: 'Agregar',
        update: 'Actualizar',
        close: 'Cerrar',
        confirmDeleteInventory: '¿Estás seguro de que quieres eliminar este inventario? Esta acción no se puede deshacer.',
        confirmDeleteItem: '¿Estás seguro de que quieres eliminar este elemento?',
        confirmDeleteField: '¿Estás seguro de que quieres eliminar este campo?',
        confirmRemoveWriter: '¿Estás seguro de que quieres eliminar este editor?',
        settingsSaved: 'Configuración guardada exitosamente',
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
        autoSave: 'Auto-guardado',
        refresh: 'Refrescar',
        retry: 'Reintentar'
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
    
    // Update UI without reload
    updateNav();
    loadPage();
}

// Toast
function showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 animate__animated animate__fadeInRight`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: duration });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// API
async function apiCall(url, options = {}) {
    try {
        const res = await fetch(url, {
            ...options,
            headers: { 
                'Content-Type': 'application/json', 
                ...options.headers 
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            if (res.status === 409) {
                showToast(t('conflict'), 'warning');
            }
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (err) {
        console.error('API call failed:', err);
        showToast(err.message, 'danger');
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
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => new bootstrap.Tooltip(el));
}

// Social Login
async function loginWithGoogle() {
    try {
        // Load Google Identity Services
        const client = google.accounts.oauth2.initCodeClient({
            client_id: 'YOUR_GOOGLE_CLIENT_ID',
            scope: 'email profile',
            ux_mode: 'popup',
            callback: async (response) => {
                if (response.code) {
                    const data = await apiCall('/auth/google', {
                        method: 'POST',
                        body: JSON.stringify({ code: response.code })
                    });
                    currentUser = data.user;
                    updateNav();
                    loadPage();
                    showToast('Login successful', 'success');
                }
            },
        });
        client.requestCode();
    } catch (err) {
        console.error('Google login failed:', err);
        showToast('Google login failed', 'danger');
    }
}

async function loginWithFacebook() {
    try {
        FB.login(async (response) => {
            if (response.authResponse) {
                const data = await apiCall('/auth/facebook', {
                    method: 'POST',
                    body: JSON.stringify({
                        accessToken: response.authResponse.accessToken,
                        userID: response.authResponse.userID
                    })
                });
                currentUser = data.user;
                updateNav();
                loadPage();
                showToast('Login successful', 'success');
            }
        }, { scope: 'email' });
    } catch (err) {
        console.error('Facebook login failed:', err);
        showToast('Facebook login failed', 'danger');
    }
}

// Modals
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
    
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            modal.hide();
            currentUser = data.user;
            updateNav();
            loadPage();
            showToast(t('Login successful'), 'success');
        } catch (err) {
            // Error already shown by apiCall
        }
    };
}

function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
    
    document.getElementById('registerForm').onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            const data = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
            modal.hide();
            currentUser = data.user;
            updateNav();
            loadPage();
            showToast(t('Registration successful'), 'success');
        } catch (err) {
            // Error already shown by apiCall
        }
    };
}

function showCreateInventoryModal() {
    loadCategories().then(() => {
        const modal = new bootstrap.Modal(document.getElementById('createInventoryModal'));
        modal.show();
    });
}

async function logout() {
    await fetch('/auth/logout');
    currentUser = null;
    updateNav();
    loadPage();
    showToast(t('Logged out'), 'success');
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
        app.innerHTML = `<div class="alert alert-danger animate__animated animate__fadeIn">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error: ${err.message}
        </div>`;
    }
}

// Load categories from database
async function loadCategories() {
    try {
        const categories = await apiCall('/api/categories');
        return categories;
    } catch (err) {
        console.error('Failed to load categories:', err);
        return ['Equipment', 'Furniture', 'Book', 'Other'];
    }
}

// Populate category dropdowns
async function populateCategoryDropdowns() {
    const categories = await loadCategories();
    const dropdowns = document.querySelectorAll('.category-dropdown');
    
    dropdowns.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = categories.map(cat => 
            `<option value="${cat}" ${currentValue === cat ? 'selected' : ''}>${cat}</option>`
        ).join('');
    });
}

async function loadHome() {
    try {
        const [latest, popular, tags] = await Promise.all([
            apiCall('/api/inventories'),
            apiCall('/api/inventories/popular'),
            apiCall('/api/tags')
        ]);
        
        document.getElementById('app').innerHTML = `
            <div class="row animate__animated animate__fadeIn">
                <div class="col-lg-8">
                    <!-- Header with Create Button -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 class="fw-bold mb-1">${t('latestInventories')}</h2>
                            <p class="text-muted">Browse recently created inventories</p>
                        </div>
                        ${currentUser ? `
                            <button class="btn btn-primary btn-lg" onclick="showCreateInventoryModal()">
                                <i class="bi bi-plus-circle me-2"></i>${t('createInventory')}
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Latest Inventories Grid -->
                    <div class="row g-4">
                        ${latest.map(inv => `
                            <div class="col-md-6">
                                <div class="card inventory-card h-100 animate__animated animate__fadeInUp">
                                    ${inv.imageUrl ? `
                                        <img src="${inv.imageUrl}" class="card-img-top" alt="${inv.title}" 
                                             style="height: 160px; object-fit: cover;">
                                    ` : ''}
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-start mb-2">
                                            <h5 class="card-title fw-bold mb-0">${inv.title}</h5>
                                            <span class="badge bg-primary">${inv.category}</span>
                                        </div>
                                        <p class="card-text text-muted small mb-3">
                                            ${inv.description ? inv.description.substring(0, 100) + '...' : 'No description'}
                                        </p>
                                        <div class="inventory-meta">
                                            <div class="inventory-meta-item">
                                                <i class="bi bi-person-circle"></i>
                                                <span>${inv.creator?.name || 'Unknown'}</span>
                                            </div>
                                            <div class="inventory-meta-item">
                                                <i class="bi bi-box"></i>
                                                <span>${inv.itemCount || 0} items</span>
                                            </div>
                                            <div class="inventory-meta-item">
                                                <i class="bi bi-clock"></i>
                                                <span>${new Date(inv.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button class="btn btn-outline-primary w-100 mt-3" onclick="viewInventory(${inv.id})">
                                            <i class="bi bi-eye me-2"></i>${t('view')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Popular Inventories -->
                    <h2 class="fw-bold mt-5 mb-3">${t('popularInventories')}</h2>
                    <div class="list-group popular-list mb-4">
                        ${popular.map(inv => `
                            <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                                    onclick="viewInventory(${inv.id})">
                                <div>
                                    <i class="bi bi-box me-2 text-primary"></i>
                                    <span class="fw-medium">${inv.title}</span>
                                    <small class="text-muted ms-2">by ${inv.creator?.name || 'Unknown'}</small>
                                </div>
                                <span class="badge bg-primary rounded-pill">${inv.itemCount || 0} items</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Sidebar -->
                <div class="col-lg-4">
                    <!-- Search -->
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title fw-bold mb-3">
                                <i class="bi bi-search me-2"></i>${t('search')}
                            </h5>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="${t('search')}" 
                                       id="searchInput" onkeyup="if(event.key==='Enter') searchInventories()">
                                <button class="btn btn-primary" onclick="searchInventories()">
                                    <i class="bi bi-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tags Cloud -->
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title fw-bold mb-3">
                                <i class="bi bi-tags me-2"></i>${t('tags')}
                            </h5>
                            <div class="tags-cloud">
                                ${tags.map(tag => `
                                    <span class="tag" onclick="searchByTag('${tag.name}')" 
                                          style="font-size: ${Math.min(1.2, 0.9 + tag.count * 0.02)}rem;">
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
            <div class="row animate__animated animate__fadeIn">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                     style="width: 64px; height: 64px; font-size: 24px; font-weight: bold;">
                                    ${currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 class="fw-bold mb-1">${currentUser.name}</h3>
                                    <p class="text-muted mb-0">
                                        <i class="bi bi-envelope me-2"></i>${currentUser.email}
                                    </p>
                                    <p class="text-muted mb-0">
                                        <i class="bi bi-calendar me-2"></i>Member since ${new Date(currentUser.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="fw-bold mb-0">
                                <i class="bi bi-box me-2"></i>${t('myInventories')}
                            </h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="list-group list-group-flush">
                                ${owned.map(inv => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <a href="#" onclick="viewInventory(${inv.id})" class="fw-medium text-decoration-none">
                                                ${inv.title}
                                            </a>
                                            <br>
                                            <small class="text-muted">
                                                <i class="bi bi-box me-1"></i>${inv.itemCount || 0} items
                                            </small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteInventory(${inv.id})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                                ${owned.length === 0 ? `
                                    <div class="list-group-item text-center text-muted py-4">
                                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                                        No inventories yet
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="fw-bold mb-0">
                                <i class="bi bi-pencil-square me-2"></i>${t('accessibleInventories')}
                            </h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="list-group list-group-flush">
                                ${accessible.map(inv => `
                                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                                            onclick="viewInventory(${inv.id})">
                                        <div>
                                            <span class="fw-medium">${inv.title}</span>
                                            <br>
                                            <small class="text-muted">
                                                <i class="bi bi-person me-1"></i>${inv.creator?.name}
                                            </small>
                                        </div>
                                        <span class="badge bg-primary rounded-pill">${inv.itemCount || 0} items</span>
                                    </button>
                                `).join('')}
                                ${accessible.length === 0 ? `
                                    <div class="list-group-item text-center text-muted py-4">
                                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                                        No accessible inventories
                                    </div>
                                ` : ''}
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

async function loadAdmin() {
    if (!currentUser?.isAdmin) {
        loadHome();
        return;
    }
    
    try {
        const users = await apiCall('/api/admin/users');
        
        document.getElementById('app').innerHTML = `
            <div class="animate__animated animate__fadeIn">
                <h2 class="fw-bold mb-4">
                    <i class="bi bi-shield-lock me-2 text-primary"></i>${t('admin')}
                </h2>
                
                <div class="card">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>${t('name')}</th>
                                        <th>${t('email')}</th>
                                        <th class="text-center">Admin</th>
                                        <th class="text-center">Blocked</th>
                                        <th class="text-center">${t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(user => `
                                        <tr>
                                            <td><span class="badge bg-secondary">#${user.id}</span></td>
                                            <td class="fw-medium">${user.name}</td>
                                            <td>${user.email}</td>
                                            <td class="text-center">
                                                <div class="form-check form-switch d-inline-block">
                                                    <input type="checkbox" class="form-check-input" 
                                                           ${user.isAdmin ? 'checked' : ''} 
                                                           onchange="toggleAdmin(${user.id})"
                                                           ${user.id === currentUser.id ? 'disabled' : ''}>
                                                </div>
                                            </td>
                                            <td class="text-center">
                                                <div class="form-check form-switch d-inline-block">
                                                    <input type="checkbox" class="form-check-input" 
                                                           ${user.isBlocked ? 'checked' : ''} 
                                                           onchange="toggleBlock(${user.id})">
                                                </div>
                                            </td>
                                            <td class="text-center">
                                                <button class="btn btn-sm btn-outline-danger" 
                                                        onclick="deleteUser(${user.id})"
                                                        ${user.id === currentUser.id ? 'disabled' : ''}
                                                        data-bs-toggle="tooltip" title="Delete user">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <button class="btn btn-light mt-3" onclick="loadHome()">
                    <i class="bi bi-arrow-left me-2"></i>${t('home')}
                </button>
            </div>
        `;
        
        // Initialize tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(el => new bootstrap.Tooltip(el));
    } catch (err) {
        document.getElementById('app').innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

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

async function uploadInventoryImage(inventoryId, file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const res = await fetch(`/api/inventories/${inventoryId}/image`, {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        currentInventory.imageUrl = data.imageUrl;
        showToast(t('imageUploaded'), 'success');
        return data.imageUrl;
    } catch (err) {
        showToast(err.message, 'danger');
        throw err;
    }
}

async function loadInventory() {
    if (!currentInventory) return;
    
    const canEdit = currentUser && (currentUser.isAdmin || currentInventory.creatorId === currentUser.id);
    const canWrite = currentUser && (
        currentInventory.isPublic ||
        currentInventory.creatorId === currentUser.id ||
        currentUser.isAdmin ||
        currentInventory.writers?.some(w => w.id === currentUser.id)
    );
    
    document.getElementById('app').innerHTML = `
        <div class="animate__animated animate__fadeIn">
            <!-- Back Button -->
            <div class="mb-3">
                <button class="btn btn-light" onclick="loadHome()">
                    <i class="bi bi-arrow-left me-2"></i>${t('home')}
                </button>
            </div>
            
            <!-- Inventory Header Card -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h2 class="fw-bold mb-2">${currentInventory.title}</h2>
                            <div class="mb-3">${marked.parse(currentInventory.description || '')}</div>
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <span class="badge bg-primary">${currentInventory.category}</span>
                                ${JSON.parse(currentInventory.tags || '[]').map(tag => 
                                    `<span class="badge bg-light text-dark tag" onclick="searchByTag('${tag}')">${tag}</span>`
                                ).join('')}
                            </div>
                            <div class="inventory-meta">
                                <div class="inventory-meta-item">
                                    <i class="bi bi-person-circle"></i>
                                    <span>${currentInventory.creator?.name}</span>
                                </div>
                                <div class="inventory-meta-item">
                                    <i class="bi bi-calendar"></i>
                                    <span>${new Date(currentInventory.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div class="inventory-meta-item">
                                    <i class="bi bi-box"></i>
                                    <span>${currentInventory.items?.length || 0} items</span>
                                </div>
                                <div class="inventory-meta-item">
                                    <i class="bi bi-chat"></i>
                                    <span>${currentInventory.comments?.length || 0} comments</span>
                                </div>
                            </div>
                        </div>
                        ${canEdit ? `
                            <div class="col-md-4">
                                <div class="image-upload-container text-center p-3 border rounded">
                                    ${currentInventory.imageUrl ? `
                                        <img src="${currentInventory.imageUrl}" class="img-fluid rounded mb-2" 
                                             style="max-height: 120px; width: auto;">
                                        <div class="d-flex gap-2 justify-content-center">
                                            <button class="btn btn-sm btn-outline-primary" onclick="triggerImageUpload()">
                                                <i class="bi bi-pencil"></i> ${t('changeImage')}
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="removeInventoryImage()">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    ` : `
                                        <div class="dropzone p-3" onclick="document.getElementById('imageUpload').click()">
                                            <i class="bi bi-cloud-upload fs-1 d-block mb-2"></i>
                                            <p class="mb-0">${t('dropImageHere')}</p>
                                        </div>
                                        <input type="file" id="imageUpload" class="d-none" accept="image/*" 
                                               onchange="handleImageUpload(event)">
                                    `}
                                </div>
                            </div>
                        ` : currentInventory.imageUrl ? `
                            <div class="col-md-4">
                                <img src="${currentInventory.imageUrl}" class="img-fluid rounded" 
                                     style="max-height: 120px; width: auto;">
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Tabs -->
            <ul class="nav nav-tabs" id="inventoryTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="items-tab" data-bs-toggle="tab" data-bs-target="#items" 
                            type="button" role="tab">
                        <i class="bi bi-table me-2"></i>${t('items')}
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="comments-tab" data-bs-toggle="tab" data-bs-target="#comments" 
                            type="button" role="tab">
                        <i class="bi bi-chat me-2"></i>${t('comments')}
                    </button>
                </li>
                ${canEdit ? `
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings" 
                                type="button" role="tab">
                            <i class="bi bi-gear me-2"></i>${t('settings')}
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="idformat-tab" data-bs-toggle="tab" data-bs-target="#idformat" 
                                type="button" role="tab">
                            <i class="bi bi-upc-scan me-2"></i>${t('idFormat')}
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="fields-tab" data-bs-toggle="tab" data-bs-target="#fields" 
                                type="button" role="tab">
                            <i class="bi bi-grid-3x3-gap me-2"></i>${t('fields')}
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="access-tab" data-bs-toggle="tab" data-bs-target="#access" 
                                type="button" role="tab">
                            <i class="bi bi-people me-2"></i>${t('access')}
                        </button>
                    </li>
                ` : ''}
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="stats-tab" data-bs-toggle="tab" data-bs-target="#stats" 
                            type="button" role="tab">
                        <i class="bi bi-graph-up me-2"></i>${t('statistics')}
                    </button>
                </li>
            </ul>
            
            <!-- Tab Content -->
            <div class="tab-content p-4 bg-white border rounded-bottom shadow-sm" id="inventoryTabContent">
                <div class="tab-pane fade show active" id="items" role="tabpanel">
                    ${renderItemsTab(canWrite)}
                </div>
                <div class="tab-pane fade" id="comments" role="tabpanel">
                    ${renderCommentsTab()}
                </div>
                ${canEdit ? `
                    <div class="tab-pane fade" id="settings" role="tabpanel">
                        ${renderSettingsTab()}
                    </div>
                    <div class="tab-pane fade" id="idformat" role="tabpanel">
                        ${renderIdFormatTab()}
                    </div>
                    <div class="tab-pane fade" id="fields" role="tabpanel">
                        ${renderFieldsTab()}
                    </div>
                    <div class="tab-pane fade" id="access" role="tabpanel">
                        ${renderAccessTab()}
                    </div>
                ` : ''}
                <div class="tab-pane fade" id="stats" role="tabpanel">
                    ${renderStatsTab()}
                </div>
            </div>
        </div>
    `;
    
    // Initialize tabs
    const triggerTabList = document.querySelectorAll('#inventoryTabs button');
    triggerTabList.forEach(triggerEl => {
        const tabTrigger = new bootstrap.Tab(triggerEl);
        triggerEl.addEventListener('click', event => {
            event.preventDefault();
            tabTrigger.show();
        });
    });
    
    // Load categories for settings
    if (canEdit) {
        await populateCategoryDropdowns();
    }
    
    // Load stats
    setTimeout(() => loadStats(), 100);
}

function renderItemsTab(canWrite) {
    const fields = currentInventory.fields || [];
    const items = currentInventory.items || [];
    
    return `
        <div class="mb-3">
            ${canWrite ? `
                <button class="btn btn-primary" onclick="showAddItemModal()">
                    <i class="bi bi-plus-circle me-2"></i>${t('addItem')}
                </button>
            ` : ''}
        </div>
        
        <div class="table-responsive">
            <table class="table table-hover items-table">
                <thead>
                    <tr>
                        <th>${t('customId')}</th>
                        ${fields.filter(f => f.showInTable).map(f => `<th>${f.title}</th>`).join('')}
                        <th class="text-center">Likes</th>
                        <th class="text-center">${t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => {
                        const data = JSON.parse(item.data || '{}');
                        return `
                            <tr>
                                <td>
                                    <span class="badge bg-light text-dark">${item.customId}</span>
                                </td>
                                ${fields.filter(f => f.showInTable).map(f => 
                                    `<td class="item-value">${data[f.title] || ''}</td>`
                                ).join('')}
                                <td class="text-center">
                                    <button class="btn btn-sm btn-link text-decoration-none" onclick="likeItem(${item.id})">
                                        <i class="bi bi-heart${item.liked ? '-fill text-danger' : ''}"></i>
                                    </button>
                                    <span class="badge bg-light">${item.likesCount || 0}</span>
                                </td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewItem(${item.id})">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    ${canWrite ? `
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                    ${items.length === 0 ? `
                        <tr>
                            <td colspan="${fields.filter(f => f.showInTable).length + 3}" class="text-center py-4">
                                <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                                <p class="text-muted mb-0">No items yet</p>
                                ${canWrite ? `
                                    <button class="btn btn-primary btn-sm mt-2" onclick="showAddItemModal()">
                                        <i class="bi bi-plus-circle me-2"></i>${t('addItem')}
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
}

function renderCommentsTab() {
    const comments = currentInventory.comments || [];
    
    return `
        <div class="row">
            <div class="col-md-8">
                <div class="comments-list">
                    ${comments.map(comment => `
                        <div class="comment animate__animated animate__fadeIn">
                            <div class="comment-header">
                                <div>
                                    <a href="#" onclick="viewUser(${comment.userId})" class="comment-author">
                                        <i class="bi bi-person-circle me-1"></i>${comment.userName}
                                    </a>
                                    <span class="comment-date ms-2">
                                        <i class="bi bi-clock me-1"></i>
                                        ${new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div class="comment-content">${marked.parse(comment.content)}</div>
                        </div>
                    `).join('')}
                    ${comments.length === 0 ? `
                        <div class="text-center text-muted py-4">
                            <i class="bi bi-chat fs-1 d-block mb-2"></i>
                            <p class="mb-0">No comments yet</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${currentUser ? `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title fw-bold mb-3">
                                <i class="bi bi-pencil me-2"></i>${t('addComment')}
                            </h5>
                            <textarea class="form-control mb-3" id="commentContent" rows="4" 
                                      placeholder="Write your comment..."></textarea>
                            <button class="btn btn-primary w-100" onclick="addInventoryComment()">
                                <i class="bi bi-send me-2"></i>${t('addComment')}
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderSettingsTab() {
    return `
        <form id="settingsForm" class="needs-validation" novalidate>
            <div class="row g-4">
                <div class="col-12">
                    <label class="form-label fw-semibold">${t('title')}</label>
                    <input type="text" class="form-control form-control-lg" id="settingsTitle" 
                           value="${currentInventory.title}" required onchange="markPendingChanges()">
                </div>
                
                <div class="col-12">
                    <label class="form-label fw-semibold">${t('description')}</label>
                    <textarea class="form-control" id="settingsDescription" rows="4" 
                              onchange="markPendingChanges()">${currentInventory.description || ''}</textarea>
                </div>
                
                <div class="col-md-6">
                    <label class="form-label fw-semibold">${t('category')}</label>
                    <select class="form-select category-dropdown" id="settingsCategory" onchange="markPendingChanges()">
                        <option value="">Select category...</option>
                    </select>
                </div>
                
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Tags</label>
                    <input type="text" class="form-control" id="settingsTags" 
                           value="${JSON.parse(currentInventory.tags || '[]').join(', ')}" 
                           placeholder="Enter tags separated by commas"
                           onchange="markPendingChanges()">
                    <div class="form-text">${t('Separate tags with commas')}</div>
                </div>
                
                <div class="col-12">
                    <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input" id="settingsIsPublic" 
                               ${currentInventory.isPublic ? 'checked' : ''} onchange="markPendingChanges()"
                               style="width: 3rem; height: 1.5rem;">
                        <label class="form-check-label fw-semibold" for="settingsIsPublic">
                            ${t('public')}
                            <span class="d-block text-muted small">Anyone can view and add items</span>
                        </label>
                    </div>
                </div>
                
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        <small>Version: ${currentInventory.version}. Changes are auto-saved every 7 seconds.</small>
                    </div>
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary mt-3">
                <i class="bi bi-save me-2"></i>${t('save')}
            </button>
        </form>
    `;
}

function renderIdFormatTab() {
    return `
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h5 class="fw-bold mb-0">${t('idFormat')}</h5>
                            <button class="btn btn-warning" onclick="showIdBuilderModal()">
                                <i class="bi bi-pencil me-2"></i>Edit Format
                            </button>
                        </div>
                        
                        <div class="id-builder mb-4 p-3 bg-light rounded" id="idFormatPreview">
                            ${renderIdParts()}
                        </div>
                        
                        <div class="bg-white p-3 rounded-3">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-eye-fill text-primary me-2"></i>
                                <strong class="me-3">${t('preview')}:</strong>
                                <code class="bg-light p-2 rounded-3 flex-grow-1">${generatePreview()}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderIdParts() {
    const format = JSON.parse(currentInventory.customIdFormat || '[{"type":"sequence","padding":3}]');
    return format.map((part, index) => {
        let display = '';
        switch(part.type) {
            case 'text': display = part.value; break;
            case 'sequence': display = `SEQ(${part.padding || 3})`; break;
            case 'date': display = 'DATE'; break;
            case 'random6': display = 'RND6'; break;
            case 'random9': display = 'RND9'; break;
            case 'random20': display = 'RND20'; break;
            case 'random32': display = 'RND32'; break;
            case 'guid': display = 'GUID'; break;
        }
        return `<span class="id-part" data-index="${index}">${display}</span>`;
    }).join('');
}

function renderFieldsTab() {
    const fields = currentInventory.fields || [];
    
    return `
        <div class="row">
            <div class="col-md-8">
                <h5 class="fw-bold mb-3">${t('fields')}</h5>
                <div class="fields-list" id="fieldsList">
                    ${fields.map(field => `
                        <div class="field-card" data-id="${field.id}">
                            <div class="field-info">
                                <h6 class="fw-bold mb-1">
                                    <i class="bi bi-grip-vertical me-2 text-muted" style="cursor: move;"></i>
                                    ${field.title}
                                </h6>
                                <span class="field-type">
                                    <i class="bi bi-${field.type === 'text' ? 'font' : 
                                                         field.type === 'textarea' ? 'text-paragraph' :
                                                         field.type === 'number' ? '123' :
                                                         field.type === 'checkbox' ? 'check-square' : 'file'} me-1"></i>
                                    ${field.type}
                                </span>
                                ${field.description ? `<small class="text-muted d-block mt-1">${field.description}</small>` : ''}
                            </div>
                            <div>
                                <span class="field-badge ${field.showInTable ? 'bg-primary text-white' : ''}">
                                    ${field.showInTable ? 'In table' : 'Hidden'}
                                </span>
                                <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteField(${field.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                    ${fields.length === 0 ? `
                        <div class="text-center text-muted py-4">
                            <i class="bi bi-grid-3x3-gap fs-1 d-block mb-2"></i>
                            <p class="mb-0">No fields yet</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="bi bi-plus-circle me-2"></i>${t('addField')}
                        </h5>
                        
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${t('fieldType')}</label>
                            <select class="form-select" id="fieldType">
                                <option value="text">📝 Single Line Text</option>
                                <option value="textarea">📄 Multi Line Text</option>
                                <option value="number">🔢 Number</option>
                                <option value="checkbox">✅ Checkbox</option>
                                <option value="document">📎 Document Link</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${t('fieldTitle')}</label>
                            <input type="text" class="form-control" id="fieldTitle" 
                                   placeholder="e.g., Model, Price, etc.">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${t('fieldDescription')}</label>
                            <input type="text" class="form-control" id="fieldDescription" 
                                   placeholder="Optional hint for users">
                        </div>
                        
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="fieldShowInTable">
                            <label class="form-check-label" for="fieldShowInTable">
                                ${t('showInTable')}
                            </label>
                        </div>
                        
                        <button class="btn btn-primary w-100" onclick="addField()">
                            <i class="bi bi-plus-circle me-2"></i>${t('addField')}
                        </button>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-body">
                        <small class="text-muted">
                            <i class="bi bi-info-circle me-2"></i>
                            <strong>Field limits:</strong><br>
                            • Max 3 of each type<br>
                            • Drag to reorder fields<br>
                            • Fields marked "In table" appear in items view
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAccessTab() {
    const writers = currentInventory.writers || [];
    
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="bi bi-people me-2"></i>${t('writers')}
                        </h5>
                        
                        <div class="writer-list">
                            ${writers.map(user => `
                                <div class="writer-item">
                                    <div class="writer-info">
                                        <div class="writer-avatar">
                                            ${user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div class="fw-medium">${user.name}</div>
                                            <small class="writer-email">${user.email}</small>
                                        </div>
                                    </div>
                                    <button class="btn btn-sm btn-outline-danger" onclick="removeWriter(${user.id})">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            `).join('')}
                            ${writers.length === 0 ? `
                                <div class="text-center text-muted py-3">
                                    <i class="bi bi-person-plus fs-1 d-block mb-2"></i>
                                    <p class="mb-0">No writers added yet</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="bi bi-person-plus me-2"></i>${t('addWriter')}
                        </h5>
                        
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${t('searchUsers')}</label>
                            <input type="text" class="form-control" id="writerSearch" 
                                   placeholder="Type name or email...">
                            <div id="searchResults" class="list-group mt-2"></div>
                        </div>
                        
                        <div class="alert alert-info small">
                            <i class="bi bi-info-circle me-2"></i>
                            Search for users by name or email to grant them write access.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStatsTab() {
    return `
        <div class="row g-4" id="statsContainer">
            <div class="col-12 text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">${t('loading')}</span>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function generatePreview() {
    const format = JSON.parse(currentInventory.customIdFormat || '[{"type":"sequence","padding":3}]');
    let preview = '';
    for (const part of format) {
        switch(part.type) {
            case 'text':
                preview += part.value || '';
                break;
            case 'random6':
                preview += '123456';
                break;
            case 'random9':
                preview += '123456789';
                break;
            case 'random20':
                preview += 'a1b2c3d4e5';
                break;
            case 'random32':
                preview += 'x9y8z7w6v5u4t3s2r1q0';
                break;
            case 'date':
                preview += new Date().toISOString().split('T')[0].replace(/-/g, '');
                break;
            case 'sequence':
                preview += '001';
                break;
            case 'guid':
                preview += '550e8400-e29b-41d4-a716-446655440000';
                break;
        }
    }
    return preview;
}

// Auto-save
function startAutoSave() {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
        if (pendingChanges && currentInventory) {
            saveInventorySettings();
        }
    }, 7000);
}

function markPendingChanges() {
    pendingChanges = true;
}

async function saveInventorySettings() {
    if (!currentInventory || !pendingChanges) return;
    
    const title = document.getElementById('settingsTitle')?.value;
    const description = document.getElementById('settingsDescription')?.value;
    const category = document.getElementById('settingsCategory')?.value;
    const tagsInput = document.getElementById('settingsTags')?.value;
    const isPublic = document.getElementById('settingsIsPublic')?.checked;
    
    if (title) {
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
        
        try {
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
            showAutoSaveIndicator();
            showToast(t('autoSave'), 'success', 1500);
        } catch (err) {
            if (err.message.includes('Conflict')) {
                showToast(t('conflict'), 'warning');
            }
        }
    }
}

function showAutoSaveIndicator() {
    const indicator = document.querySelector('.auto-save-indicator');
    if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 2000);
    }
}

// Image upload handlers
function triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleImageUpload(e);
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
    
    await uploadInventoryImage(currentInventory.id, file);
    await loadInventory();
}

async function removeInventoryImage() {
    if (!confirm('Remove image?')) return;
    
    try {
        // Call API to remove image
        await apiCall(`/api/inventories/${currentInventory.id}/image`, {
            method: 'DELETE'
        });
        currentInventory.imageUrl = null;
        await loadInventory();
        showToast('Image removed', 'success');
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Actions
async function createInventory() {
    const title = document.getElementById('invTitle').value;
    const description = document.getElementById('invDescription').value;
    const category = document.getElementById('invCategory').value;
    const tagsInput = document.getElementById('invTags').value;
    const isPublic = document.getElementById('invIsPublic').checked;
    
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    try {
        const inventory = await apiCall('/api/inventories', {
            method: 'POST',
            body: JSON.stringify({ title, description, category, tags, isPublic })
        });
        
        bootstrap.Modal.getInstance(document.getElementById('createInventoryModal')).hide();
        showToast(t('Inventory created'), 'success');
        viewInventory(inventory.id);
    } catch (err) {
        // Error already shown by apiCall
    }
}

async function deleteInventory(id) {
    if (!confirm(t('confirmDeleteInventory'))) return;
    
    try {
        await apiCall(`/api/inventories/${id}`, { method: 'DELETE' });
        showToast(t('Inventory deleted'), 'success');
        loadHome();
    } catch (err) {
        // Error already shown by apiCall
    }
}

async function addField() {
    const type = document.getElementById('fieldType').value;
    const title = document.getElementById('fieldTitle').value;
    const description = document.getElementById('fieldDescription').value;
    const showInTable = document.getElementById('fieldShowInTable').checked;
    
    if (!title) {
        showToast('Please enter a field title', 'warning');
        return;
    }
    
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/fields`, {
            method: 'POST',
            body: JSON.stringify({ type, title, description, showInTable })
        });
        
        document.getElementById('fieldTitle').value = '';
        document.getElementById('fieldDescription').value = '';
        document.getElementById('fieldShowInTable').checked = false;
        
        showToast(t('fieldAdded'), 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        if (err.message.includes('Maximum')) {
            showToast(err.message, 'warning');
        }
    }
}

async function deleteField(id) {
    if (!confirm(t('confirmDeleteField'))) return;
    
    try {
        await apiCall(`/api/fields/${id}`, { method: 'DELETE' });
        showToast(t('fieldDeleted'), 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        // Error already shown by apiCall
    }
}

async function showAddItemModal() {
    if (!currentInventory) return;
    
    const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
    const container = document.getElementById('itemFields');
    
    container.innerHTML = (currentInventory.fields || []).map(field => {
        const fieldId = `field_${field.id}`;
        switch(field.type) {
            case 'text':
                return `
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${field.title}</label>
                            <input type="text" class="form-control" data-field="${field.title}" 
                                   data-type="text" id="${fieldId}" placeholder="${field.description || ''}">
                            ${field.description ? `<small class="text-muted">${field.description}</small>` : ''}
                        </div>
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="col-12">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${field.title}</label>
                            <textarea class="form-control" data-field="${field.title}" 
                                      data-type="textarea" id="${fieldId}" rows="3" 
                                      placeholder="${field.description || ''}"></textarea>
                            ${field.description ? `<small class="text-muted">${field.description}</small>` : ''}
                        </div>
                    </div>
                `;
            case 'number':
                return `
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${field.title}</label>
                            <input type="number" class="form-control" data-field="${field.title}" 
                                   data-type="number" id="${fieldId}" placeholder="${field.description || ''}">
                            ${field.description ? `<small class="text-muted">${field.description}</small>` : ''}
                        </div>
                    </div>
                `;
            case 'checkbox':
                return `
                    <div class="col-md-6">
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" data-field="${field.title}" 
                                   data-type="checkbox" id="${fieldId}">
                            <label class="form-check-label fw-semibold" for="${fieldId}">
                                ${field.title}
                            </label>
                            ${field.description ? `<small class="text-muted d-block">${field.description}</small>` : ''}
                        </div>
                    </div>
                `;
            case 'document':
                return `
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">${field.title}</label>
                            <input type="url" class="form-control" data-field="${field.title}" 
                                   data-type="document" id="${fieldId}" placeholder="https://...">
                            ${field.description ? `<small class="text-muted">${field.description}</small>` : ''}
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }).join('');
    
    modal.show();
}

async function addItem() {
    const customId = document.getElementById('itemCustomId').value;
    
    const fields = document.querySelectorAll('#itemFields [data-field]');
    const data = {};
    fields.forEach(field => {
        const fieldName = field.dataset.field;
        if (field.type === 'checkbox') {
            data[fieldName] = field.checked;
        } else {
            data[fieldName] = field.value;
        }
    });
    
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/items`, {
            method: 'POST',
            body: JSON.stringify({ customId, data })
        });
        
        bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
        showToast(t('itemAdded'), 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        if (err.message.includes('Duplicate')) {
            showToast(t('duplicateCustomId'), 'warning');
        }
    }
}

async function deleteItem(id) {
    if (!confirm(t('confirmDeleteItem'))) return;
    
    try {
        await apiCall(`/api/items/${id}`, { method: 'DELETE' });
        showToast(t('itemDeleted'), 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        // Error already shown by apiCall
    }
}

async function likeItem(id) {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    try {
        const result = await apiCall(`/api/items/${id}/like`, { method: 'POST' });
        showToast(result.liked ? 'Liked' : 'Unliked', 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        // Error already shown by apiCall
    }
}

async function addInventoryComment() {
    const content = document.getElementById('commentContent').value;
    if (!content) return;
    
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        
        document.getElementById('commentContent').value = '';
        showToast(t('commentAdded'), 'success');
    } catch (err) {
        // Error already shown by apiCall
    }
}

// Admin actions
async function toggleAdmin(id) {
    try {
        await apiCall(`/api/admin/users/${id}/toggle-admin`, { method: 'POST' });
        showToast('Updated', 'success');
        loadAdmin();
    } catch (err) {
        // Error already shown by apiCall
    }
}

async function toggleBlock(id) {
    try {
        await apiCall(`/api/admin/users/${id}/toggle-block`, { method: 'POST' });
        showToast('Updated', 'success');
        loadAdmin();
    } catch (err) {
        // Error already shown by apiCall
    }
}

async function deleteUser(id) {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
        await apiCall(`/api/admin/users/${id}`, { method: 'DELETE' });
        showToast('User deleted', 'success');
        loadAdmin();
    } catch (err) {
        // Error already shown by apiCall
    }
}

// ID Builder
function showIdBuilderModal() {
    const modal = new bootstrap.Modal(document.getElementById('idBuilderModal'));
    currentIdFormat = JSON.parse(currentInventory.customIdFormat || '[{"type":"sequence","padding":3}]');
    renderIdBuilder();
    modal.show();
}

function renderIdBuilder() {
    const builder = document.getElementById('idBuilder');
    if (!builder) return;
    
    builder.innerHTML = currentIdFormat.map((part, index) => {
        let display = '';
        switch(part.type) {
            case 'text': display = part.value; break;
            case 'sequence': display = `SEQ(${part.padding || 3})`; break;
            case 'date': display = 'DATE'; break;
            case 'random6': display = 'RND6'; break;
            case 'random9': display = 'RND9'; break;
            case 'random20': display = 'RND20'; break;
            case 'random32': display = 'RND32'; break;
            case 'guid': display = 'GUID'; break;
        }
        return `<span class="id-part" data-index="${index}">
            ${display} 
            <span class="remove" onclick="removeIdPart(${index})" data-bs-toggle="tooltip" title="${t('clickToRemove')}">
                <i class="bi bi-x"></i>
            </span>
        </span>`;
    }).join('');
    
    document.getElementById('idPreview').textContent = generatePreviewFromFormat(currentIdFormat);
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => new bootstrap.Tooltip(el));
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

function addTextPart() {
    const text = prompt('Enter text:');
    if (text) {
        currentIdFormat.push({ type: 'text', value: text });
        renderIdBuilder();
    }
}

function addRandomPart(digits) {
    const type = digits === 6 ? 'random6' : 
                 digits === 9 ? 'random9' :
                 digits === 20 ? 'random20' : 'random32';
    currentIdFormat.push({ type });
    renderIdBuilder();
}

function addDatePart() {
    currentIdFormat.push({ type: 'date' });
    renderIdBuilder();
}

function addSequencePart() {
    const padding = prompt('Number of digits (default 3):', '3');
    currentIdFormat.push({ type: 'sequence', padding: parseInt(padding) || 3 });
    renderIdBuilder();
}

function addGuidPart() {
    currentIdFormat.push({ type: 'guid' });
    renderIdBuilder();
}

function removeIdPart(index) {
    currentIdFormat.splice(index, 1);
    renderIdBuilder();
}

async function saveIdFormat() {
    try {
        await apiCall(`/api/inventories/${currentInventory.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...currentInventory,
                customIdFormat: JSON.stringify(currentIdFormat),
                version: currentInventory.version
            })
        });
        
        bootstrap.Modal.getInstance(document.getElementById('idBuilderModal')).hide();
        showToast(t('idFormatSaved'), 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        if (err.message.includes('Conflict')) {
            showToast(t('conflict'), 'warning');
        }
    }
}

// Access management
let searchTimeout;
document.addEventListener('input', (e) => {
    if (e.target.id === 'writerSearch') {
        clearTimeout(searchTimeout);
        const query = e.target.value;
        if (query.length < 2) return;
        
        searchTimeout = setTimeout(async () => {
            try {
                const users = await apiCall(`/api/inventories/${currentInventory.id}/access/search?q=${encodeURIComponent(query)}`);
                const results = document.getElementById('searchResults');
                results.innerHTML = users.map(user => `
                    <button class="list-group-item list-group-item-action writer-result" onclick="addWriter(${user.id})">
                        <div class="d-flex align-items-center">
                            <div class="writer-avatar me-2">${user.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <div class="fw-medium">${user.name}</div>
                                <small class="text-muted">${user.email}</small>
                            </div>
                        </div>
                    </button>
                `).join('');
            } catch (err) {
                console.error('Search failed:', err);
            }
        }, 300);
    }
});

async function addWriter(userId) {
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/access`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
        
        document.getElementById('writerSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';
        showToast(t('writerAdded'), 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        if (err.message.includes('already has access')) {
            showToast(err.message, 'warning');
        }
    }
}

async function removeWriter(userId) {
    if (!confirm(t('confirmRemoveWriter'))) return;
    
    try {
        await apiCall(`/api/inventories/${currentInventory.id}/access/${userId}`, { method: 'DELETE' });
        showToast(t('writerRemoved'), 'success');
        viewInventory(currentInventory.id);
    } catch (err) {
        // Error already shown by apiCall
    }
}

// Statistics
async function loadStats() {
    try {
        const stats = await apiCall(`/api/inventories/${currentInventory.id}/stats`);
        const container = document.getElementById('statsContainer');
        
        let html = `
            <div class="col-md-4">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalItems}</div>
                    <div class="stat-label">${t('Total Items')}</div>
                </div>
            </div>
        `;
        
        Object.entries(stats.numericFields).forEach(([field, data]) => {
            html += `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="fw-bold mb-3">📊 ${field}</h6>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Min:</span>
                                <span class="fw-medium">${data.min}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Max:</span>
                                <span class="fw-medium">${data.max}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Avg:</span>
                                <span class="fw-medium">${data.avg.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="text-muted">Count:</span>
                                <span class="fw-medium">${data.count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        Object.entries(stats.textFrequencies).forEach(([field, frequencies]) => {
            html += `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="fw-bold mb-3">📝 ${field}</h6>
                            ${Object.entries(frequencies).map(([value, count]) => `
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-muted text-truncate" style="max-width: 150px;">${value}:</span>
                                    <span class="fw-medium">${count} time${count > 1 ? 's' : ''}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="col-12"><p class="text-center text-muted py-4">No statistics available</p></div>';
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

// Search
async function searchInventories() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;
    
    try {
        const results = await apiCall(`/api/inventories/search?q=${encodeURIComponent(query)}`);
        
        // Show results in a modal or navigate to search page
        if (results.length === 0) {
            showToast('No results found', 'info');
        } else {
            // You can implement a search results page here
            console.log('Search results:', results);
            showToast(`Found ${results.length} results`, 'success');
        }
    } catch (err) {
        console.error('Search failed:', err);
    }
}

function searchByTag(tag) {
    // Navigate to tag search results
    window.location.href = `/search?tag=${encodeURIComponent(tag)}`;
}

// Settings form
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'settingsForm') {
        e.preventDefault();
        await saveInventorySettings();
        showToast(t('settingsSaved'), 'success');
    }
});

// Socket.io
socket.on('new-comment', (comment) => {
    if (comment.inventoryId === currentInventory?.id) {
        const list = document.getElementById('comments-list');
        if (list) {
            const commentHtml = `
                <div class="comment animate__animated animate__fadeIn">
                    <div class="comment-header">
                        <a href="#" onclick="viewUser(${comment.userId})" class="comment-author">
                            <i class="bi bi-person-circle me-1"></i>${comment.userName}
                        </a>
                        <span class="comment-date">
                            <i class="bi bi-clock me-1"></i>
                            ${new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div class="comment-content">${marked.parse(comment.content)}</div>
                </div>
            `;
            list.innerHTML = commentHtml + list.innerHTML;
        }
    }
});

socket.on('new-inventory-comment', (comment) => {
    if (comment.inventoryId === currentInventory?.id) {
        const list = document.getElementById('comments-list');
        if (list) {
            const commentHtml = `
                <div class="comment animate__animated animate__fadeIn">
                    <div class="comment-header">
                        <a href="#" onclick="viewUser(${comment.userId})" class="comment-author">
                            <i class="bi bi-person-circle me-1"></i>${comment.userName}
                        </a>
                        <span class="comment-date">
                            <i class="bi bi-clock me-1"></i>
                            ${new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div class="comment-content">${marked.parse(comment.content)}</div>
                </div>
            `;
            list.innerHTML = commentHtml + list.innerHTML;
        }
    }
});

// Drag and drop for fields
function initDragAndDrop() {
    const fieldsList = document.getElementById('fieldsList');
    if (!fieldsList) return;
    
    new Sortable(fieldsList, {
        animation: 150,
        handle: '.bi-grip-vertical',
        onEnd: async (evt) => {
            const orders = [];
            document.querySelectorAll('.field-card').forEach((card, index) => {
                const id = card.dataset.id;
                if (id) {
                    orders.push({ id: parseInt(id), order: index + 1 });
                }
            });
            
            try {
                await apiCall('/api/fields/reorder', {
                    method: 'PUT',
                    body: JSON.stringify({ orders })
                });
                showToast('Fields reordered', 'success', 1500);
            } catch (err) {
                console.error('Failed to reorder fields:', err);
            }
        }
    });
}

// Initialize
document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    currentPage = 'home';
    loadPage();
});

// Initialize theme and auth
initTheme();
checkAuth();

// Start auto-save when on inventory page
setInterval(() => {
    if (currentPage === 'inventory' && currentInventory) {
        startAutoSave();
    }
}, 1000);