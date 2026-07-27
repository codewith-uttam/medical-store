// Import the required libraries (packages) for our backend
const sqlite3 = require('sqlite3').verbose(); // SQLite3 is a simple, file-based database. "verbose()" gives us detailed error messages.
const path = require('path');                 // 'path' helps us safely build file paths on any operating system (Windows/Mac/Linux).
const bcrypt = require('bcryptjs');           // 'bcryptjs' is a tool used to securely scramble (hash) passwords so they aren't saved as plain text.

// Decide exactly where to save our database file on the computer.
// '__dirname' means "the folder where this file is currently located".
// So, this creates a file named 'store.db' inside our 'backend' folder.
const dbPath = path.resolve(__dirname, 'store.db');

// Connect to the database file (or create it if it doesn't exist yet)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        // If something goes wrong connecting, print an error message.
        console.error('Error opening database', err.message);
    } else {
        // If successful, let us know!
        console.log('Connected to the SQLite database.');
        
        // db.serialize ensures that these database commands run one after another, in order.
        // This is important because we can't insert data into a table before the table is created!
        db.serialize(() => {
            
            // 1. MEDICINES TABLE
            // This table stores all the medicines we have in our inventory.
            db.run(`CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,  -- A unique ID number that automatically goes up (1, 2, 3...)
                name TEXT NOT NULL,                    -- The brand name of the medicine (Cannot be empty)
                generic_name TEXT,                     -- The scientific/chemical name
                batch_no TEXT,                         -- The manufacturing batch number
                expiry_date TEXT NOT NULL,             -- When the medicine expires
                quantity INTEGER NOT NULL DEFAULT 0,   -- How many we have in stock (starts at 0)
                price REAL NOT NULL,                   -- The selling price (REAL means it can have decimals)
                manufacturer TEXT                      -- The company that made it
            )`);

            // 2. BILLS TABLE
            // This table stores the main receipt/invoice details for every sale we make.
            db.run(`CREATE TABLE IF NOT EXISTS bills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,           -- The Invoice Number
                date TEXT NOT NULL,                             -- The exact date and time the bill was made
                total_amount REAL NOT NULL,                     -- The cost before any discounts
                discount REAL DEFAULT 0,                        -- The discount applied (if any)
                net_amount REAL NOT NULL,                       -- The final amount the customer actually pays
                customer_name TEXT DEFAULT 'Walk-in Customer'   -- The name of the person buying (defaults to "Walk-in")
            )`);

            // This line is a "Migration". If an older version of this database exists without the 'customer_name' column,
            // this safely adds it without crashing the app.
            db.run(`ALTER TABLE bills ADD COLUMN customer_name TEXT DEFAULT 'Walk-in Customer'`, () => {});

            // 3. BILL_ITEMS TABLE
            // This table links specific medicines to a specific bill. 
            // If someone buys 3 different medicines, 1 bill is created, but 3 'bill_items' are saved here.
            db.run(`CREATE TABLE IF NOT EXISTS bill_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bill_id INTEGER,                                -- Which bill this item belongs to
                medicine_id INTEGER,                            -- Which medicine was sold
                quantity INTEGER NOT NULL,                      -- How many they bought
                price REAL NOT NULL,                            -- Price per unit at the time of sale
                total REAL NOT NULL,                            -- (quantity * price)
                FOREIGN KEY(bill_id) REFERENCES bills(id),      -- Links to the 'bills' table
                FOREIGN KEY(medicine_id) REFERENCES medicines(id) -- Links to the 'medicines' table
            )`);

            // 4. USERS TABLE
            // This table stores the staff/admin accounts who are allowed to log in to the software.
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,                  -- The login name (must be unique)
                password_hash TEXT NOT NULL,                    -- The scrambled, secure password
                role TEXT DEFAULT 'admin'                       -- Permissions (e.g., 'admin' or 'cashier')
            )`, (err) => {
                if (err) return; // If there's an error creating the table, stop here.

                // SEEDING THE DEFAULT ADMIN
                // Check if there are ANY users in the database yet.
                db.get(`SELECT COUNT(*) as count FROM users`, [], (err, row) => {
                    // If we already have users, we don't need to do anything.
                    if (err || row.count > 0) return;
                    
                    // If the database is completely empty (0 users), we create the first Admin account automatically!
                    // We use bcrypt to scramble the password 'admin123' so it's safe.
                    const hash = bcrypt.hashSync('admin123', 10);
                    
                    // Save the new admin into the database
                    db.run(
                        `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
                        ['admin', hash, 'admin'],
                        () => console.log('Default admin user created: admin / admin123') // Print a helpful message
                    );
                });
            });
        });
    }
});

// Export the database connection so other files (like server.js) can use it to read and write data.
module.exports = db;

