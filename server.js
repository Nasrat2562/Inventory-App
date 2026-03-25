require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const multer = require('multer');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');
const querystring = require('querystring');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ==================== DATABASE SETUP ====================
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

// Define Models with additional fields for integrations
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    theme: { type: DataTypes.STRING, defaultValue: 'light' },
    language: { type: DataTypes.STRING, defaultValue: 'en' },
    // Salesforce integration fields
    salesforceAccountId: { type: DataTypes.STRING },
    salesforceContactId: { type: DataTypes.STRING },
    syncedToSalesforce: { type: DataTypes.BOOLEAN, defaultValue: false },
    syncedAt: { type: DataTypes.DATE }
}, {
    timestamps: true
});

const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false }
}, {
    timestamps: true
});

const Inventory = sequelize.define('Inventory', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING, allowNull: false },
    tags: { type: DataTypes.TEXT, defaultValue: '[]' },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
    imageUrl: { type: DataTypes.STRING },
    customIdFormat: { type: DataTypes.TEXT, defaultValue: '[{"type":"sequence","padding":3}]' },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    // Odoo integration field
    apiToken: { type: DataTypes.STRING }
}, {
    timestamps: true
});

const Field = sequelize.define('Field', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    showInTable: { type: DataTypes.BOOLEAN, defaultValue: false },
    order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    timestamps: true
});

const Item = sequelize.define('Item', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customId: { type: DataTypes.STRING, allowNull: false },
    data: { type: DataTypes.TEXT, defaultValue: '{}' },
    version: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['inventoryId', 'customId']
        }
    ]
});

const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    content: { type: DataTypes.TEXT, allowNull: false }
}, {
    timestamps: true
});

const Like = sequelize.define('Like', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['itemId', 'userId']
        }
    ]
});

const Access = sequelize.define('Access', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }
}, {
    timestamps: true
});

const Tag = sequelize.define('Tag', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    count: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
    timestamps: true
});

// Define ALL relationships
User.hasMany(Inventory, { as: 'ownedInventories', foreignKey: 'creatorId' });
Inventory.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

Inventory.hasMany(Field, { foreignKey: 'inventoryId' });
Field.belongsTo(Inventory, { foreignKey: 'inventoryId' });

Inventory.hasMany(Item, { foreignKey: 'inventoryId' });
Item.belongsTo(Inventory, { foreignKey: 'inventoryId' });

User.hasMany(Item, { as: 'createdItems', foreignKey: 'createdBy' });
Item.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

Inventory.hasMany(Comment, { foreignKey: 'inventoryId' });
Comment.belongsTo(Inventory, { foreignKey: 'inventoryId' });

Item.hasMany(Comment, { foreignKey: 'itemId' });
Comment.belongsTo(Item, { foreignKey: 'itemId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Item.hasMany(Like, { foreignKey: 'itemId' });
Like.belongsTo(Item, { foreignKey: 'itemId' });

User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

Inventory.belongsToMany(User, { through: Access, as: 'writers', foreignKey: 'inventoryId' });
User.belongsToMany(Inventory, { through: Access, as: 'accessibleInventories', foreignKey: 'userId' });

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) return done(null, false, { message: 'Incorrect email.' });
            if (user.isBlocked) return done(null, false, { message: 'Account is blocked.' });
            
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return done(null, false, { message: 'Incorrect password.' });
            
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// File upload
const upload = multer({ dest: tempDir });

// ==================== HELPER FUNCTIONS ====================
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized' });
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) return next();
    res.status(403).json({ error: 'Forbidden' });
}

async function canWriteInventory(req, inventoryId) {
    if (!req.user) return false;
    if (req.user.isAdmin) return true;
    
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) return false;
    
    if (inventory.creatorId === req.user.id) return true;
    if (inventory.isPublic) return true;
    
    const access = await Access.findOne({
        where: { inventoryId, userId: req.user.id }
    });
    
    return !!access;
}

async function generateCustomId(format, inventoryId) {
    let result = '';
    const parsedFormat = typeof format === 'string' ? JSON.parse(format) : format;
    
    const items = await Item.findAll({
        where: { inventoryId },
        order: [['createdAt', 'ASC']]
    });
    
    for (const part of parsedFormat) {
        switch (part.type) {
            case 'text':
                result += part.value || '';
                break;
            case 'random6':
                result += Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                break;
            case 'random9':
                result += Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
                break;
            case 'random20':
                result += Math.floor(Math.random() * 1000000).toString(16).padStart(5, '0') + 
                         Math.floor(Math.random() * 1000000).toString(16).padStart(5, '0');
                break;
            case 'random32':
                result += Math.floor(Math.random() * 1000000000).toString(36) + 
                         Math.floor(Math.random() * 1000000000).toString(36);
                break;
            case 'guid':
                result += 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                break;
            case 'date':
                result += new Date().toISOString().split('T')[0].replace(/-/g, '');
                break;
            case 'sequence':
                const numbers = items
                    .map(i => parseInt(i.customId))
                    .filter(n => !isNaN(n));
                const maxSeq = numbers.length > 0 ? Math.max(...numbers) : 0;
                result += (maxSeq + 1).toString().padStart(part.padding || 3, '0');
                break;
        }
    }
    return result;
}

async function getAdminEmails() {
    const admins = await User.findAll({
        where: { isAdmin: true },
        attributes: ['email']
    });
    return admins.map(a => a.email);
}

// ==================== AUTH ROUTES ====================
app.post('/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: info.message });
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isAdmin: user.isAdmin,
                    theme: user.theme,
                    language: user.language,
                    createdAt: user.createdAt,
                    syncedToSalesforce: user.syncedToSalesforce
                }
            });
        });
    })(req, res, next);
});

app.post('/auth/register', async (req, res) => {
    const { email, name, password } = req.body;
    
    try {
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            name,
            password: hashedPassword
        });
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isAdmin: user.isAdmin,
                    theme: user.theme,
                    language: user.language,
                    createdAt: user.createdAt,
                    syncedToSalesforce: user.syncedToSalesforce
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.json({ success: true });
    });
});

// ==================== USER ROUTES ====================
app.get('/api/user', (req, res) => {
    if (req.user) {
        res.json({
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            isAdmin: req.user.isAdmin,
            theme: req.user.theme,
            language: req.user.language,
            createdAt: req.user.createdAt,
            syncedToSalesforce: req.user.syncedToSalesforce
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.get('/api/user/inventories', ensureAuth, async (req, res) => {
    try {
        const inventories = await Inventory.findAll({
            where: { creatorId: req.user.id },
            include: [
                { model: User, as: 'creator', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        const result = await Promise.all(inventories.map(async (inv) => {
            const itemCount = await Item.count({ where: { inventoryId: inv.id } });
            return {
                ...inv.toJSON(),
                itemCount
            };
        }));
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/user/accessible', ensureAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: Inventory,
                as: 'accessibleInventories',
                include: [
                    { model: User, as: 'creator', attributes: ['name'] }
                ]
            }]
        });
        
        const result = await Promise.all((user.accessibleInventories || []).map(async (inv) => {
            const itemCount = await Item.count({ where: { inventoryId: inv.id } });
            return {
                ...inv.toJSON(),
                itemCount
            };
        }));
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user/preferences', ensureAuth, async (req, res) => {
    const { theme, language } = req.body;
    
    try {
        await User.update({ theme, language }, { where: { id: req.user.id } });
        req.user.theme = theme;
        req.user.language = language;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== SALESFORCE INTEGRATION ====================
async function getSalesforceToken() {
    if (!process.env.SF_CLIENT_ID) {
        throw new Error('Salesforce not configured');
    }
    
    const authUrl = `${process.env.SF_LOGIN_URL || 'https://login.salesforce.com'}/services/oauth2/token`;
    const data = querystring.stringify({
        grant_type: 'password',
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        username: process.env.SF_USERNAME,
        password: `${process.env.SF_PASSWORD}${process.env.SF_SECURITY_TOKEN}`
    });

    const response = await axios.post(authUrl, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return response.data;
}

// In server.js, update the Salesforce sync route
app.post('/api/user/sync-to-salesforce', ensureAuth, async (req, res) => {
    const { company, phone, position, industry } = req.body;
    
    // Check if Salesforce is configured
    if (!process.env.SF_CLIENT_ID || !process.env.SF_CLIENT_SECRET) {
        return res.status(400).json({ 
            error: 'Salesforce not configured',
            demo: true
        });
    }
    
    try {
        // Check if we have valid credentials
        const tokenData = await getSalesforceToken().catch(err => {
            console.error('Salesforce token error:', err.message);
            return null;
        });
        
        if (!tokenData) {
            return res.status(400).json({ 
                error: 'Salesforce authentication failed. Check your credentials.',
                demo: true
            });
        }
        
        // Rest of the code...
        const instanceUrl = tokenData.instance_url;
        const accessToken = tokenData.access_token;
        
        // Create Account
        const accountData = {
            Name: company || `${req.user.name}'s Company`,
            Industry: industry || 'Technology',
            Phone: phone || req.user.email,
            Type: 'Customer'
        };
        
        const accountResponse = await axios.post(
            `${instanceUrl}/services/data/v58.0/sobjects/Account`,
            accountData,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        
        const accountId = accountResponse.data.id;
        
        // Create Contact
        const nameParts = req.user.name.split(' ');
        const contactData = {
            FirstName: nameParts[0],
            LastName: nameParts.slice(1).join(' ') || 'User',
            Email: req.user.email,
            Phone: phone,
            Title: position || 'User',
            AccountId: accountId
        };
        
        const contactResponse = await axios.post(
            `${instanceUrl}/services/data/v58.0/sobjects/Contact`,
            contactData,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        
        await User.update(
            { 
                salesforceAccountId: accountId,
                salesforceContactId: contactResponse.data.id,
                syncedToSalesforce: true,
                syncedAt: new Date()
            },
            { where: { id: req.user.id } }
        );
        
        res.json({ 
            success: true, 
            accountId, 
            contactId: contactResponse.data.id,
            message: 'User synced to Salesforce successfully'
        });
        
    } catch (err) {
        console.error('Salesforce sync error:', err.response?.data || err.message);
        
        let errorMessage = 'Failed to sync to Salesforce. ';
        if (err.response?.status === 400) {
            errorMessage += 'Check your credentials in .env file.';
        } else if (err.response?.status === 401) {
            errorMessage += 'Authentication failed. Reset your security token.';
        } else {
            errorMessage += err.message;
        }
        
        res.status(500).json({ error: errorMessage, demo: true });
    }
});

// ==================== ODOO INTEGRATION ====================
app.get('/api/inventories/:id/odoo-data', async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    const apiToken = req.headers['x-api-token'];
    
    try {
        const inventory = await Inventory.findByPk(inventoryId, {
            include: [
                { model: Field },
                { model: Item },
                { model: User, as: 'creator', attributes: ['name'] }
            ]
        });
        
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found' });
        }
        
        // Validate API token
        if (!inventory.apiToken || inventory.apiToken !== apiToken) {
            return res.status(401).json({ error: 'Invalid API token' });
        }
        
        // Calculate statistics
        const fields = inventory.Fields;
        const items = inventory.Items;
        const statistics = {};
        
        // Numeric fields stats
        const numericFields = fields.filter(f => f.type === 'number');
        for (const field of numericFields) {
            const values = items
                .map(item => {
                    const data = JSON.parse(item.data || '{}');
                    return parseFloat(data[field.title]);
                })
                .filter(v => !isNaN(v));
            
            if (values.length > 0) {
                statistics[field.title] = {
                    type: 'numeric',
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    count: values.length
                };
            }
        }
        
        // Text fields stats - top 5 most frequent
        const textFields = fields.filter(f => f.type === 'text' || f.type === 'textarea');
        for (const field of textFields) {
            const frequencies = {};
            items.forEach(item => {
                const data = JSON.parse(item.data || '{}');
                const value = data[field.title];
                if (value && typeof value === 'string' && value.trim()) {
                    frequencies[value] = (frequencies[value] || 0) + 1;
                }
            });
            
            const topValues = Object.entries(frequencies)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([value, count]) => ({ value, count }));
            
            if (topValues.length > 0) {
                statistics[field.title] = {
                    type: 'text',
                    topValues: topValues,
                    totalValues: items.length
                };
            }
        }
        
        const result = {
            inventory: {
                id: inventory.id,
                title: inventory.title,
                description: inventory.description,
                category: inventory.category,
                tags: JSON.parse(inventory.tags || '[]'),
                creator: inventory.creator.name,
                createdAt: inventory.createdAt,
                totalItems: items.length,
                imageUrl: inventory.imageUrl
            },
            fields: fields.map(f => ({
                id: f.id,
                title: f.title,
                type: f.type,
                description: f.description,
                showInTable: f.showInTable,
                order: f.order
            })),
            statistics: statistics,
            exportDate: new Date().toISOString()
        };
        
        res.json(result);
        
    } catch (err) {
        console.error('Odoo API error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventories/:id/generate-token', ensureAuth, async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found' });
        }
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        // Generate random API token
        const token = crypto.randomBytes(32).toString('hex');
        
        inventory.apiToken = token;
        await inventory.save();
        
        res.json({ token });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== POWER AUTOMATE / DROPBOX INTEGRATION ====================
// In server.js, update the support ticket route
app.post('/api/support/ticket', ensureAuth, async (req, res) => {
    const { summary, priority, inventoryId } = req.body;
    
    if (!summary) {
        return res.status(400).json({ error: 'Summary is required' });
    }
    
    try {
        let inventory = null;
        if (inventoryId) {
            inventory = await Inventory.findByPk(inventoryId);
        }
        
        const ticketData = {
            ticketId: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            reportedBy: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            },
            inventory: inventory ? {
                id: inventory.id,
                title: inventory.title
            } : null,
            link: req.headers.referer || 'Unknown page',
            priority: priority || 'Average',
            summary: summary,
            timestamp: new Date().toISOString(),
            admins: await getAdminEmails()
        };
        
        const fileName = `support-ticket-${ticketData.ticketId}.json`;
        const jsonContent = JSON.stringify(ticketData, null, 2);
        
        // Ensure support-tickets directory exists
        const ticketsDir = path.join(__dirname, 'support-tickets');
        if (!fs.existsSync(ticketsDir)) {
            fs.mkdirSync(ticketsDir, { recursive: true });
        }
        
        // Save locally
        fs.writeFileSync(path.join(ticketsDir, fileName), jsonContent);
        
        // Try Dropbox if configured
        if (process.env.DROPBOX_ACCESS_TOKEN && process.env.DROPBOX_ACCESS_TOKEN !== '') {
            try {
                await axios.post(
                    'https://content.dropboxapi.com/2/files/upload',
                    jsonContent,
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                            'Dropbox-API-Arg': JSON.stringify({
                                path: `/support-tickets/${fileName}`,
                                mode: 'add',
                                autorename: true,
                                mute: false
                            }),
                            'Content-Type': 'application/octet-stream'
                        }
                    }
                );
            } catch (dropboxErr) {
                console.log('Dropbox upload failed, saved locally only');
            }
        }
        
        res.json({
            success: true,
            ticketId: ticketData.ticketId,
            filePath: `support-tickets/${fileName}`,
            message: 'Support ticket created successfully'
        });
        
    } catch (err) {
        console.error('Ticket creation error:', err);
        res.status(500).json({ error: 'Failed to create support ticket: ' + err.message });
    }
});

// ==================== ADMIN ROUTES ====================
app.get('/api/admin/users', ensureAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'name', 'isAdmin', 'isBlocked', 'createdAt', 'syncedToSalesforce']
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/users/:id/toggle-block', ensureAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/users/:id/toggle-admin', ensureAdmin, async (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot change your own admin status' });
        }
        
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.isAdmin = !user.isAdmin;
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/users/:id', ensureAdmin, async (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        
        await User.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== CATEGORY ROUTES ====================
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories.map(c => c.name));
    } catch (err) {
        res.json(['Equipment', 'Furniture', 'Book', 'Other']);
    }
});

// ==================== INVENTORY ROUTES ====================
app.get('/api/inventories', async (req, res) => {
    try {
        const inventories = await Inventory.findAll({
            include: [
                { model: User, as: 'creator', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        
        const result = await Promise.all(inventories.map(async (inv) => {
            const itemCount = await Item.count({ where: { inventoryId: inv.id } });
            return {
                ...inv.toJSON(),
                itemCount
            };
        }));
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/inventories/popular', async (req, res) => {
    try {
        const inventories = await Inventory.findAll({
            include: [
                { model: User, as: 'creator', attributes: ['name'] }
            ]
        });
        
        const result = await Promise.all(inventories.map(async (inv) => {
            const itemCount = await Item.count({ where: { inventoryId: inv.id } });
            return {
                ...inv.toJSON(),
                itemCount
            };
        }));
        
        res.json(result.sort((a, b) => b.itemCount - a.itemCount).slice(0, 5));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/inventories/search', async (req, res) => {
    const { q } = req.query;
    
    try {
        const inventories = await Inventory.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } },
                    { tags: { [Op.like]: `%${q}%` } }
                ]
            },
            include: [
                { model: User, as: 'creator', attributes: ['name'] }
            ]
        });
        res.json(inventories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/inventories/tag/:tag', async (req, res) => {
    const tag = req.params.tag;
    
    try {
        const inventories = await Inventory.findAll({
            where: {
                tags: { [Op.like]: `%${tag}%` }
            },
            include: [
                { model: User, as: 'creator', attributes: ['name'] }
            ]
        });
        res.json(inventories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/inventories/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const inventory = await Inventory.findByPk(id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name'] },
                { 
                    model: Field,
                    order: [['order', 'ASC']]
                },
                {
                    model: User,
                    as: 'writers',
                    attributes: ['id', 'name', 'email'],
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        const items = await Item.findAll({
            where: { inventoryId: id },
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        const comments = await Comment.findAll({
            where: { inventoryId: id },
            include: [{ model: User, attributes: ['id', 'name'] }],
            order: [['createdAt', 'ASC']]
        });
        
        const itemIds = items.map(i => i.id);
        const likes = await Like.findAll({
            where: { itemId: { [Op.in]: itemIds } }
        });
        
        const result = inventory.toJSON();
        result.comments = comments;
        result.items = items.map(item => {
            const itemLikes = likes.filter(l => l.itemId === item.id);
            return {
                ...item.toJSON(),
                likesCount: itemLikes.length,
                liked: req.user ? itemLikes.some(l => l.userId === req.user.id) : false
            };
        });
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventories', ensureAuth, async (req, res) => {
    const { title, description, category, tags, isPublic } = req.body;
    
    try {
        const inventory = await Inventory.create({
            title,
            description,
            category: category || 'Other',
            tags: JSON.stringify(tags || []),
            isPublic,
            creatorId: req.user.id
        });
        
        if (tags && tags.length) {
            for (const tagName of tags) {
                const [tag] = await Tag.findOrCreate({
                    where: { name: tagName }
                });
                await tag.increment('count');
            }
        }
        
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventories/:id/image', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        const inventory = await Inventory.findByPk(req.params.id);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        // For demo, just store the image in temp folder and return a path
        const imageUrl = `/uploads/${req.file.filename}`;
        
        // Move file to public/uploads
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.renameSync(req.file.path, path.join(uploadDir, req.file.filename));
        
        inventory.imageUrl = imageUrl;
        await inventory.save();
        
        res.json({ imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inventories/:id/image', ensureAuth, async (req, res) => {
    try {
        const inventory = await Inventory.findByPk(req.params.id);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        inventory.imageUrl = null;
        await inventory.save();
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/inventories/:id', ensureAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, category, tags, isPublic, customIdFormat, version } = req.body;
    
    try {
        const inventory = await Inventory.findByPk(id);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        if (inventory.version !== version) {
            return res.status(409).json({ error: 'Conflict - please refresh' });
        }
        
        await inventory.update({
            title,
            description,
            category,
            tags: JSON.stringify(tags || []),
            isPublic,
            customIdFormat: customIdFormat ? JSON.stringify(customIdFormat) : inventory.customIdFormat,
            version: inventory.version + 1
        });
        
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inventories/:id', ensureAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const inventory = await Inventory.findByPk(id);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        await inventory.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== FIELD ROUTES ====================
app.post('/api/inventories/:id/fields', ensureAuth, async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    const { type, title, description, showInTable } = req.body;
    
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const fieldCount = await Field.count({
            where: { inventoryId, type }
        });
        
        const limits = { text: 3, textarea: 3, number: 3, checkbox: 3, document: 3 };
        if (fieldCount >= limits[type]) {
            return res.status(400).json({ error: `Maximum ${limits[type]} fields of type ${type} allowed` });
        }
        
        const maxOrder = await Field.max('order', { where: { inventoryId } }) || 0;
        
        const field = await Field.create({
            type,
            title,
            description,
            showInTable,
            order: maxOrder + 1,
            inventoryId
        });
        
        res.json(field);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/fields/reorder', ensureAuth, async (req, res) => {
    const { orders } = req.body;
    
    try {
        for (const { id, order } of orders) {
            const field = await Field.findByPk(id);
            if (field) {
                const inventory = await Inventory.findByPk(field.inventoryId);
                if (inventory.creatorId === req.user.id || req.user.isAdmin) {
                    field.order = order;
                    await field.save();
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/fields/:id', ensureAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const field = await Field.findByPk(id);
        if (!field) return res.status(404).json({ error: 'Field not found' });
        
        const inventory = await Inventory.findByPk(field.inventoryId);
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        await field.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== ITEM ROUTES ====================
app.get('/api/items/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const item = await Item.findByPk(id, {
            include: [
                { model: Inventory, include: [Field] },
                { model: User, as: 'creator', attributes: ['id', 'name'] }
            ]
        });
        
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        const comments = await Comment.findAll({
            where: { itemId: id },
            include: [{ model: User, attributes: ['id', 'name'] }],
            order: [['createdAt', 'ASC']]
        });
        
        const likes = await Like.count({ where: { itemId: id } });
        const liked = req.user ? await Like.findOne({ where: { itemId: id, userId: req.user.id } }) : false;
        
        const result = item.toJSON();
        result.comments = comments;
        result.likesCount = likes;
        result.liked = !!liked;
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventories/:id/items', ensureAuth, async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    const { customId, data } = req.body;
    
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        const hasAccess = await canWriteInventory(req, inventoryId);
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        let finalCustomId = customId;
        if (!finalCustomId) {
            finalCustomId = await generateCustomId(inventory.customIdFormat, inventoryId);
        }
        
        const existing = await Item.findOne({
            where: { inventoryId, customId: finalCustomId }
        });
        
        if (existing) {
            return res.status(409).json({ error: 'Duplicate custom ID' });
        }
        
        const item = await Item.create({
            customId: finalCustomId,
            data: JSON.stringify(data || {}),
            inventoryId,
            createdBy: req.user.id
        });
        
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/items/:id', ensureAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const { customId, data, version } = req.body;
    
    try {
        const item = await Item.findByPk(id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        const hasAccess = await canWriteInventory(req, item.inventoryId);
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        if (item.version !== version) {
            return res.status(409).json({ error: 'Conflict - please refresh' });
        }
        
        if (customId !== item.customId) {
            const existing = await Item.findOne({
                where: {
                    inventoryId: item.inventoryId,
                    customId,
                    id: { [Op.ne]: id }
                }
            });
            if (existing) {
                return res.status(409).json({ error: 'Duplicate custom ID' });
            }
        }
        
        await item.update({
            customId,
            data: JSON.stringify(data || {}),
            version: item.version + 1
        });
        
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/items/:id', ensureAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const item = await Item.findByPk(id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        const hasAccess = await canWriteInventory(req, item.inventoryId);
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        await item.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== LIKE ROUTES ====================
app.post('/api/items/:id/like', ensureAuth, async (req, res) => {
    const itemId = parseInt(req.params.id);
    const userId = req.user.id;
    
    try {
        const existing = await Like.findOne({ where: { itemId, userId } });
        
        if (existing) {
            await existing.destroy();
            const count = await Like.count({ where: { itemId } });
            res.json({ liked: false, count });
        } else {
            await Like.create({ itemId, userId });
            const count = await Like.count({ where: { itemId } });
            res.json({ liked: true, count });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== COMMENT ROUTES ====================
app.post('/api/items/:id/comments', ensureAuth, async (req, res) => {
    const itemId = parseInt(req.params.id);
    const { content } = req.body;
    
    try {
        const item = await Item.findByPk(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        const comment = await Comment.create({
            content,
            itemId,
            inventoryId: item.inventoryId,
            userId: req.user.id
        });
        
        const result = await Comment.findByPk(comment.id, {
            include: [{ model: User, attributes: ['id', 'name'] }]
        });
        
        io.to(`inventory-${item.inventoryId}`).emit('new-comment', result);
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventories/:id/comments', ensureAuth, async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    const { content } = req.body;
    
    try {
        const comment = await Comment.create({
            content,
            inventoryId,
            userId: req.user.id
        });
        
        const result = await Comment.findByPk(comment.id, {
            include: [{ model: User, attributes: ['id', 'name'] }]
        });
        
        io.to(`inventory-${inventoryId}`).emit('new-inventory-comment', result);
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== ACCESS MANAGEMENT ====================
app.get('/api/inventories/:id/access/search', ensureAuth, async (req, res) => {
    const { q } = req.query;
    
    try {
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { email: { [Op.like]: `%${q}%` } }
                ],
                id: { [Op.ne]: req.user.id }
            },
            attributes: ['id', 'name', 'email'],
            limit: 10
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventories/:id/access', ensureAuth, async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    const { userId } = req.body;
    
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const [access, created] = await Access.findOrCreate({
            where: { inventoryId, userId }
        });
        
        if (created) {
            const user = await User.findByPk(userId, { attributes: ['id', 'name', 'email'] });
            res.json(user);
        } else {
            res.status(400).json({ error: 'User already has access' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inventories/:id/access/:userId', ensureAuth, async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        
        if (inventory.creatorId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        await Access.destroy({ where: { inventoryId, userId } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== STATISTICS ====================
app.get('/api/inventories/:id/stats', async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    
    try {
        const fields = await Field.findAll({ where: { inventoryId } });
        const items = await Item.findAll({ where: { inventoryId } });
        
        const stats = {
            totalItems: items.length,
            numericFields: {},
            textFrequencies: {}
        };
        
        const numericFields = fields.filter(f => f.type === 'number');
        for (const field of numericFields) {
            const values = items
                .map(item => {
                    const data = JSON.parse(item.data || '{}');
                    return parseFloat(data[field.title]);
                })
                .filter(v => !isNaN(v));
            
            if (values.length > 0) {
                stats.numericFields[field.title] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    count: values.length
                };
            }
        }
        
        const textFields = fields.filter(f => f.type === 'text' || f.type === 'textarea');
        for (const field of textFields) {
            const frequencies = {};
            items.forEach(item => {
                const data = JSON.parse(item.data || '{}');
                const value = data[field.title];
                if (value && typeof value === 'string' && value.trim()) {
                    frequencies[value] = (frequencies[value] || 0) + 1;
                }
            });
            
            if (Object.keys(frequencies).length > 0) {
                const sorted = Object.entries(frequencies)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
                stats.textFrequencies[field.title] = sorted;
            }
        }
        
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== TAGS ====================
app.get('/api/tags', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            order: [['count', 'DESC']]
        });
        res.json(tags);
    } catch (err) {
        console.error('Tags error:', err);
        res.json([]);
    }
});

app.get('/api/tags/search', async (req, res) => {
    const { q } = req.query;
    
    try {
        const tags = await Tag.findAll({
            where: {
                name: { [Op.like]: `${q}%` }
            },
            attributes: ['name'],
            limit: 10
        });
        res.json(tags.map(t => t.name));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('join-inventory', (inventoryId) => {
        socket.join(`inventory-${inventoryId}`);
    });
    
    socket.on('leave-inventory', (inventoryId) => {
        socket.leave(`inventory-${inventoryId}`);
    });
});

// ==================== INITIALIZE DATABASE ====================
async function initializeDatabase() {
    try {
        await sequelize.sync({ force: true });
        console.log('✅ Database synced');

        await Category.bulkCreate([
            { name: 'Equipment' },
            { name: 'Furniture' },
            { name: 'Book' },
            { name: 'Other' }
        ]);
        console.log('✅ Categories created');

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            email: 'admin@example.com',
            name: 'Admin',
            password: hashedPassword,
            isAdmin: true
        });
        console.log('✅ Admin user created: admin@example.com / admin123');

        const testPassword = await bcrypt.hash('test123', 10);
        await User.create({
            email: 'test@example.com',
            name: 'Test User',
            password: testPassword
        });
        console.log('✅ Test user created: test@example.com / test123');

        await Tag.bulkCreate([
            { name: 'electronics', count: 0 },
            { name: 'office', count: 0 },
            { name: 'furniture', count: 0 },
            { name: 'books', count: 0 }
        ]);
        console.log('✅ Sample tags created');

    } catch (err) {
        console.error('Database initialization error:', err);
    }
}

// Add this route for OAuth2 flow
app.get('/auth/salesforce', (req, res) => {
    const authUrl = `https://login.salesforce.com/services/oauth2/authorize?` +
        `response_type=code&client_id=${process.env.SF_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent('http://localhost:3000/auth/salesforce/callback')}`;
    res.redirect(authUrl);
});

app.get('/auth/salesforce/callback', async (req, res) => {
    const { code } = req.query;
    
    try {
        const response = await axios.post('https://login.salesforce.com/services/oauth2/token', 
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                client_id: process.env.SF_CLIENT_ID,
                client_secret: process.env.SF_CLIENT_SECRET,
                redirect_uri: 'http://localhost:3000/auth/salesforce/callback'
            })
        );
        
        // Store token in session
        req.session.salesforceToken = response.data;
        res.send('✅ Salesforce authenticated! You can close this window and go back to the app.');
    } catch (err) {
        res.send('❌ Authentication failed: ' + err.message);
    }
});

// ==================== SERVE HTML ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
    server.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log('🚀 COMPLETE INVENTORY MANAGEMENT SYSTEM');
        console.log('='.repeat(60));
        console.log(`📱 Server: http://localhost:${PORT}`);
        console.log(`👤 Admin: admin@example.com / admin123`);
        console.log(`👤 Test: test@example.com / test123`);
        console.log('='.repeat(60));
        console.log('✅ Integrations added:');
        console.log('   • Salesforce CRM Integration');
        console.log('   • Odoo API Integration');
        console.log('   • Power Automate / Dropbox Support Tickets');
        console.log('='.repeat(60));
    });
});
