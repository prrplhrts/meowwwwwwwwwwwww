const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Configuration
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      
    password: 'password',      
    database: 'flash_sale_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. The Buying Endpoint
app.post('/buy', async (req, res) => {
    let connection;
    
    try {
        // Get a specific connection from the pool to manage the transaction
        connection = await pool.getConnection();

        // --- ATOMICITY STEP ---
        await connection.beginTransaction();

        // --- ISOLATION STEP ---
        // We use 'FOR UPDATE' to LOCK this row. 
        // If User B tries to read this row while User A is here, User B must WAIT.
        const [rows] = await connection.query(
            'SELECT stock FROM products WHERE id = 1 FOR UPDATE'
        );

        const currentStock = rows[0].stock;

        // --- CONSISTENCY STEP ---
        // Check if we have valid stock
        if (currentStock > 0) {
            
            // 1. Deduct Stock
            await connection.query('UPDATE products SET stock = stock - 1 WHERE id = 1');
            
            // 2. Create Order
            await connection.query('INSERT INTO orders (product_id) VALUES (1)');

            // --- DURABILITY STEP ---
            // Save changes permanently
            await connection.commit();
            
            // Send success response
            res.json({ success: true, message: 'Purchase Successful! Item is yours.' });

        } else {
            // Stock is 0, we cannot fulfill the order
            await connection.rollback();
            res.json({ success: false, message: 'Failed: Out of Stock.' });
        }

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Transaction Error:", error);
        res.status(500).json({ success: false, message: 'System Error' });
    } finally {
        if (connection) connection.release();
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});