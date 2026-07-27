// 1. IMPORTING REQUIRED LIBRARIES
const express = require('express');      // Express is a framework that helps us build a web server easily.
const cors = require('cors');            // CORS allows our Frontend (React) to talk to our Backend (Express).
const bcrypt = require('bcryptjs');      // Used to check if passwords match securely.
const jwt = require('jsonwebtoken');     // JSON Web Tokens (JWT) are used as digital "ID cards" to keep users logged in.
const db = require('./database');        // This imports the database setup we created in database.js

// 2. SETTING UP THE SERVER
const app = express();
const port = 5000;                       // The backend server will run on http://localhost:5000
const JWT_SECRET = 'swastik_medical_secret_2024'; // The secret "key" used to stamp our JWT ID cards. (Keep this secret!)

app.use(cors());                         // Turn on CORS so the React app can send requests here without getting blocked.
app.use(express.json());                 // Tell the server to understand data sent in "JSON" format (which React sends).

// 3. AUTHENTICATION (Security Check)
// This function acts like a bouncer at a club. Before someone can access sensitive data (like seeing users or medicines),
// they have to show their digital ID card (the token).
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // The token usually looks like "Bearer eyJhbGci...". We just want the second part.
    const token = authHeader && authHeader.split(' ')[1];
    
    // If they didn't bring an ID card, deny entry.
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    // Check if the ID card is real and hasn't expired.
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user; // They are verified! Attach their info to the request.
        next();          // Let them through to whatever they were trying to access.
    });
}

// ==========================================
//                 API ROUTES 
// ==========================================
// Think of these as "doors" on our server. The frontend knocks on a door, asks for something, and the server replies.

// --- LOGIN API ---
// Door: POST /api/login
// Job: Check username and password. If correct, give them a JWT ID card.
app.post('/api/login', (req, res) => {
    const { username, password } = req.body; // Read what the user typed in the login form

    if (!username || !password)
        return res.status(400).json({ error: 'Username and password are required.' });

    // Look for the user in the database
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

        // Compare the typed password with the scrambled password saved in the database
        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid username or password.' });

        // Password is correct! Create their digital ID card (expires in 24 hours).
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        // Send the ID card back to the frontend
        res.json({ token, username: user.username, role: user.role });
    });
});

// --- USERS MANAGEMENT APIs ---
// Notice the 'authenticateToken' in the middle? That means the bouncer checks their ID before letting them run this code.

// Get a list of all staff/users
app.get('/api/users', authenticateToken, (req, res) => {
    db.all('SELECT id, username, role FROM users ORDER BY id ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create a brand new user account
app.post('/api/users', authenticateToken, (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'Username and password are required.' });

    // Scramble their new password before saving it
    const hash = bcrypt.hashSync(password, 10);
    db.run(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hash, role || 'staff'],
        function (err) {
            if (err) {
                // If the username is already taken, sqlite throws a 'UNIQUE' error
                if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username already exists.' });
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID, username, role: role || 'staff' });
        }
    );
});

// Update an existing user's details or password
app.put('/api/users/:id', authenticateToken, (req, res) => {
    const { username, password, role } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required.' });

    if (password) {
        // If they want to change the password, we have to hash the new one
        const hash = bcrypt.hashSync(password, 10);
        db.run(
            'UPDATE users SET username=?, password_hash=?, role=? WHERE id=?',
            [username, hash, role || 'staff', req.params.id],
            function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    } else {
        // If they just want to change the name or role (not the password)
        db.run(
            'UPDATE users SET username=?, role=? WHERE id=?',
            [username, role || 'staff', req.params.id],
            function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }
});

// Delete a user
app.delete('/api/users/:id', authenticateToken, (req, res) => {
    // First, check how many users are left. We can't let them delete the very last admin!
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row.count <= 1) return res.status(400).json({ error: 'Cannot delete the last user. You need at least one to log in!' });

        // If it's safe, delete the user
        db.run('DELETE FROM users WHERE id = ?', req.params.id, function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    });
});

// --- DASHBOARD API ---
// Gets the summary numbers to show on the main dashboard screen (Today's Sales, Low Stock, etc.)
app.get('/api/dashboard', authenticateToken, (req, res) => {
    const today = new Date().toISOString().split('T')[0]; // Gets today's date like "2026-07-27"
    
    // 1. Get total sales for today
    db.get('SELECT SUM(net_amount) as totalSalesToday FROM bills WHERE date LIKE ?', [today + '%'], (err, salesRow) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // 2. Count how many different medicines we have in the database
        db.get('SELECT COUNT(*) as totalMedicines FROM medicines', [], (err, medsRow) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // 3. Find 5 medicines where we have less than 10 boxes left (Low Stock Alerts)
            db.all('SELECT * FROM medicines WHERE quantity < 10 LIMIT 5', [], (err, lowStockMeds) => {
                if (err) return res.status(500).json({ error: err.message });
                
                // Send all 3 pieces of information back to the frontend at once
                res.json({
                    totalSalesToday: salesRow.totalSalesToday || 0,
                    totalMedicines: medsRow.totalMedicines || 0,
                    lowStockMeds: lowStockMeds
                });
            });
        });
    });
});

// --- INVENTORY / MEDICINES APIs ---

// Get the full list of all medicines
app.get('/api/medicines', authenticateToken, (req, res) => {
    db.all('SELECT * FROM medicines', [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(rows);
    });
});

// Add a brand new medicine to stock
app.post('/api/medicines', authenticateToken, (req, res) => {
    const { name, generic_name, batch_no, expiry_date, quantity, price, manufacturer } = req.body;
    db.run(
        'INSERT INTO medicines (name, generic_name, batch_no, expiry_date, quantity, price, manufacturer) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, generic_name, batch_no, expiry_date, quantity, price, manufacturer],
        function (err) {
            if (err) { res.status(400).json({ error: err.message }); return; }
            res.json({ id: this.lastID }); // Tell frontend the new ID number
        }
    );
});

// Edit an existing medicine's details
app.put('/api/medicines/:id', authenticateToken, (req, res) => {
    const { name, generic_name, batch_no, expiry_date, quantity, price, manufacturer } = req.body;
    db.run(
        'UPDATE medicines SET name=?, generic_name=?, batch_no=?, expiry_date=?, quantity=?, price=?, manufacturer=? WHERE id=?',
        [name, generic_name, batch_no, expiry_date, quantity, price, manufacturer, req.params.id],
        function (err) {
            if (err) { res.status(400).json({ error: err.message }); return; }
            res.json({ updated: this.changes });
        }
    );
});

// Delete a medicine
app.delete('/api/medicines/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM medicines WHERE id = ?', req.params.id, function (err) {
        if (err) { res.status(400).json({ error: err.message }); return; }
        res.json({ deleted: this.changes });
    });
});

// --- BILLING / SALES APIs ---

// Create a new Bill (Checkout process)
app.post('/api/bills', authenticateToken, (req, res) => {
    const { items, discount, customer_name } = req.body;
    if (!items || items.length === 0)
        return res.status(400).json({ error: 'No items provided' });

    // Calculate the totals
    let total_amount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let net_amount = total_amount - (discount || 0);
    const date = new Date().toISOString();
    const cname = (customer_name || '').trim() || 'Walk-in Customer';

    // A Transaction ensures that EITHER the whole bill gets saved correctly, OR nothing saves at all.
    // We don't want half a bill saved if the server crashes in the middle!
    db.run('BEGIN TRANSACTION');
    
    // 1. Create the main Bill record
    db.run(
        'INSERT INTO bills (date, total_amount, discount, net_amount, customer_name) VALUES (?, ?, ?, ?, ?)',
        [date, total_amount, discount || 0, net_amount, cname],
        function (err) {
            if (err) { db.run('ROLLBACK'); return res.status(400).json({ error: err.message }); }
            const billId = this.lastID; // The invoice number
            
            // 2. Prepare to save each individual item they bought
            let stmt = db.prepare('INSERT INTO bill_items (bill_id, medicine_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)');
            
            for (let item of items) {
                let itemTotal = item.price * item.quantity;
                stmt.run([billId, item.medicine_id, item.quantity, item.price, itemTotal], function(err) {
                    if (err) { db.run('ROLLBACK'); return res.status(400).json({ error: err.message }); }
                });
                
                // 3. Subtract the purchased amount from our inventory automatically!
                db.run('UPDATE medicines SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.medicine_id]);
            }
            stmt.finalize();
            
            // 4. Everything worked perfectly! "COMMIT" makes all the changes permanent in the database.
            db.run('COMMIT', (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Bill created successfully', billId, net_amount });
            });
        }
    );
});

// Get a list of all past bills (Sales History)
app.get('/api/bills', authenticateToken, (req, res) => {
    db.all('SELECT * FROM bills ORDER BY date DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get all the details of ONE specific bill (Used for Printing the Invoice)
app.get('/api/bills/:id', authenticateToken, (req, res) => {
    // 1. Get the main bill info
    db.get('SELECT * FROM bills WHERE id = ?', [req.params.id], (err, bill) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!bill) return res.status(404).json({ error: 'Bill not found.' });

        // 2. Get all the items on that bill, AND join the medicines table to get the actual names of the medicines
        db.all(
            `SELECT bi.*, m.name as medicine_name, m.generic_name, m.manufacturer
             FROM bill_items bi
             JOIN medicines m ON bi.medicine_id = m.id
             WHERE bi.bill_id = ?`,
            [req.params.id],
            (err, items) => {
                if (err) return res.status(500).json({ error: err.message });
                // Combine the bill and the items into one package and send it to the frontend
                res.json({ ...bill, items });
            }
        );
    });
});

// Turn on the server!
app.listen(port, () => {
    console.log('Server running on port ' + port);
});

