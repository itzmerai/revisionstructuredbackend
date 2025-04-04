const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const util = require('util');

module.exports = (db) => {
    // Convert db.query to a promise-based function
    const query = util.promisify(db.query).bind(db);

    router.post('/', async (req, res) => {
        try {
            const { admin_name, admin_user, admin_password } = req.body;

            if (!admin_name || !admin_user || !admin_password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if username already exists
            const checkUserSql = 'SELECT admin_id FROM administrator WHERE admin_user = ?';
            const rows = await query(checkUserSql, [admin_user]);
            if (rows.length > 0) {
                return res.status(409).json({ message: 'Username already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hasheduUser = await bcrypt.hash(admin_user, salt);
            const hashedPassword = await bcrypt.hash(admin_password, salt);

            // Insert into database
            const insertSql = 'INSERT INTO administrator (admin_name, admin_user, admin_password) VALUES (?, ?, ?)';
            const result = await query(insertSql, [admin_name, hasheduUser, hashedPassword]);

            res.status(201).json({ message: 'Admin added successfully', admin_id: result.insertId });
        } catch (error) {
            console.error('Error:', error);
            // Handle duplicate entry despite check (if race condition occurs)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Username already exists' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    return router;
};