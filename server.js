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
const cloudinary = require('cloudinary').v2;
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

// ==================== CONFIGURATION ====================
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cloudinary config (optional)
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Google Auth (optional)
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

// ==================== DATABASE SETUP ====================
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

// Define Models
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING },
    googleId: { type: DataTypes.STRING },
    facebookId: { type: DataTypes.STRING },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    theme: { type: DataTypes.STRING, defaultValue: 'light' },
    language: { type: DataTypes.STRING, defaultValue: 'en' }
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
    version: { type: DataTypes.INTEGER, defaultValue: 1 }
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
// User - Inventory
User.hasMany(Inventory, { as: 'ownedInventories', foreignKey: 'creatorId' });
Inventory.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

// Inventory - Field
Inventory.hasMany(Field, { foreignKey: 'inventoryId' });
Field.belongsTo(Inventory, { foreignKey: 'inventoryId' });

// Inventory - Item
Inventory.hasMany(Item, { foreignKey: 'inventoryId' });
Item.belongsTo(Inventory, { foreignKey: 'inventoryId' });

// User - Item (creator)
User.hasMany(Item, { as: 'createdItems', foreignKey: 'createdBy' });
Item.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// Inventory - Comment
Inventory.hasMany(Comment, { foreignKey: 'inventoryId' });
Comment.belongsTo(Inventory, { foreignKey: 'inventoryId' });

// Item - Comment
Item.hasMany(Comment, { foreignKey: 'itemId' });
Comment.belongsTo(Item, { foreignKey: 'itemId' });

// User - Comment
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Item - Like
Item.hasMany(Like, { foreignKey: 'itemId' });
Like.belongsTo(Item, { foreignKey: 'itemId' });

// User - Like
User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

// Inventory - User (writers) many-to-many
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
                    createdAt: user.createdAt
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
                    createdAt: user.createdAt
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/auth/google', async (req, res) => {
    if (!googleClient) {
        return res.status(400).json({ error: 'Google login not configured' });
    }
    
    const { token } = req.body;
    
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name, sub } = payload;
        
        let user = await User.findOne({ where: { email } });
        
        if (!user) {
            user = await User.create({
                email,
                name,
                googleId: sub
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            await user.save();
        }
        
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
                    language: user.language
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/auth/facebook', async (req, res) => {
    const { accessToken, userID } = req.body;
    
    try {
        const response = await fetch(`https://graph.facebook.com/v12.0/${userID}?fields=id,name,email&access_token=${accessToken}`);
        const data = await response.json();
        
        let user = await User.findOne({ where: { email: data.email } });
        
        if (!user) {
            user = await User.create({
                email: data.email,
                name: data.name,
                facebookId: data.id
            });
        } else if (!user.facebookId) {
            user.facebookId = data.id;
            await user.save();
        }
        
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
                    language: user.language
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
            createdAt: req.user.createdAt
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

// ==================== ADMIN ROUTES ====================
app.get('/api/admin/users', ensureAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'name', 'isAdmin', 'isBlocked', 'createdAt']
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
        
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return res.status(400).json({ error: 'Cloudinary not configured' });
        }
        
        const result = await cloudinary.uploader.upload(req.file.path);
        fs.unlinkSync(req.file.path);
        
        inventory.imageUrl = result.secure_url;
        await inventory.save();
        
        res.json({ imageUrl: result.secure_url });
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
                if (value) {
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
        // Sync all models
        await sequelize.sync({ force: true });
        console.log('✅ Database synced');

        // Create categories
        await Category.bulkCreate([
            { name: 'Equipment' },
            { name: 'Furniture' },
            { name: 'Book' },
            { name: 'Other' }
        ]);
        console.log('✅ Categories created');

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            email: 'admin@example.com',
            name: 'Admin',
            password: hashedPassword,
            isAdmin: true
        });
        console.log('✅ Admin user created: admin@example.com / admin123');

        // Create test user
        const testPassword = await bcrypt.hash('test123', 10);
        await User.create({
            email: 'test@example.com',
            name: 'Test User',
            password: testPassword
        });
        console.log('✅ Test user created: test@example.com / test123');

        // Create sample tags
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
        console.log('✅ Features implemented:');
        console.log('   • User authentication & admin panel');
        console.log('   • Custom ID builder with drag & drop');
        console.log('   • Custom fields (text, textarea, number, checkbox, document)');
        console.log('   • Items with like/comment functionality');
        console.log('   • Real-time comments with Socket.io');
        console.log('   • Access control (public/private/writers)');
        console.log('   • Tags with autocomplete');
        console.log('   • Statistics dashboard');
        console.log('   • Multi-language (EN/ES)');
        console.log('   • Light/dark theme');
        console.log('   • Auto-save every 7 seconds');
        console.log('   • Optimistic locking');
        console.log('   • Cloudinary image upload');
        console.log('='.repeat(60));
    });
});
