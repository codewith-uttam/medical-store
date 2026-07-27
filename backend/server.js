require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Bill = require('./models/Bill');

// 2. SETTING UP THE SERVER
const app = express();
const port = 5000;
const JWT_SECRET = 'swastik_medical_secret_2024';

app.use(cors());
app.use(express.json());

// Connect to MongoDB and seed admin
connectDB().then(async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            const hash = bcrypt.hashSync('admin123', 10);
            await User.create({
                username: 'admin',
                password_hash: hash,
                role: 'admin'
            });
            console.log('Default admin user created: admin / admin123');
        }
    } catch (err) {
        console.error('Error seeding admin user:', err.message);
    }
});

// 3. AUTHENTICATION (Security Check)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
}

// ==========================================
//                 API ROUTES 
// ==========================================

// --- LOGIN API ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ error: 'Username and password are required.' });

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid username or password.' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- USERS MANAGEMENT APIs ---
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find().sort({ _id: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'Username and password are required.' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(409).json({ error: 'Username already exists.' });

        const hash = bcrypt.hashSync(password, 10);
        const user = await User.create({
            username,
            password_hash: hash,
            role: role || 'staff'
        });

        res.json({ id: user.id, username: user.username, role: user.role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username) return res.status(400).json({ error: 'Username is required.' });

        const updateData = { username, role: role || 'staff' };
        if (password) {
            updateData.password_hash = bcrypt.hashSync(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.json({ updated: 1 });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const count = await User.countDocuments();
        if (count <= 1) return res.status(400).json({ error: 'Cannot delete the last user. You need at least one to log in!' });

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ deleted: 1 });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- DASHBOARD API ---
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const billsToday = await Bill.aggregate([
            { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
            { $group: { _id: null, totalSalesToday: { $sum: '$net_amount' } } }
        ]);
        const totalSalesToday = billsToday.length > 0 ? billsToday[0].totalSalesToday : 0;

        const totalMedicines = await Medicine.countDocuments();

        const lowStockMeds = await Medicine.find({ quantity: { $lt: 10 } }).limit(5);

        res.json({
            totalSalesToday,
            totalMedicines,
            lowStockMeds
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- INVENTORY / MEDICINES APIs ---
app.get('/api/medicines', authenticateToken, async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/medicines', authenticateToken, async (req, res) => {
    try {
        const { name, generic_name, batch_no, expiry_date, quantity, price, manufacturer } = req.body;
        const medicine = await Medicine.create({
            name, generic_name, batch_no, expiry_date, quantity, price, manufacturer
        });
        res.json({ id: medicine.id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/medicines/:id', authenticateToken, async (req, res) => {
    try {
        const { name, generic_name, batch_no, expiry_date, quantity, price, manufacturer } = req.body;
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, {
            name, generic_name, batch_no, expiry_date, quantity, price, manufacturer
        });
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        res.json({ updated: 1 });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/medicines/:id', authenticateToken, async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        res.json({ deleted: 1 });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- BILLING / SALES APIs ---
app.post('/api/bills', authenticateToken, async (req, res) => {
    try {
        const { items, discount, customer_name } = req.body;
        if (!items || items.length === 0)
            return res.status(400).json({ error: 'No items provided' });

        let total_amount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        let net_amount = total_amount - (discount || 0);
        const cname = (customer_name || '').trim() || 'Walk-in Customer';

        const bill = new Bill({
            total_amount,
            discount: discount || 0,
            net_amount,
            customer_name: cname,
            items: items.map(item => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            }))
        });

        await bill.save();
        const billId = bill.id;

        // Subtract from inventory
        for (let item of items) {
            await Medicine.findByIdAndUpdate(item.medicine_id, {
                $inc: { quantity: -item.quantity }
            });
        }

        res.json({ message: 'Bill created successfully', billId, net_amount });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/bills', authenticateToken, async (req, res) => {
    try {
        const bills = await Bill.find().sort({ date: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills/:id', authenticateToken, async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id).populate('items.medicine_id');
        if (!bill) return res.status(404).json({ error: 'Bill not found.' });

        const billJSON = bill.toJSON();
        
        // Map populated medicine details back into the items array for the frontend
        billJSON.items = billJSON.items.map(item => {
            const med = item.medicine_id;
            return {
                id: item.id,
                medicine_id: med ? med.id : item.medicine_id, // fallback if medicine was deleted
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                medicine_name: med ? med.name : 'Unknown/Deleted Medicine',
                generic_name: med ? med.generic_name : '',
                manufacturer: med ? med.manufacturer : ''
            };
        });

        res.json(billJSON);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log('Server running on port ' + port);
});

module.exports = app;
