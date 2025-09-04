const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const pool = await poolPromise;
    // Check if email exists
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    if (result.recordset.length > 0) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate pairing code untuk athlete
    const pairingCode = role === 'athlete' ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;
    
    // Insert user
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, role)
      .input('pairing_code', sql.NVarChar, pairingCode)
      .query('INSERT INTO users (name, email, password, role, pairing_code) VALUES (@name, @email, @password, @role, @pairing_code)');
    
    res.status(201).json({ 
      msg: 'User registered',
      pairingCode: pairingCode // Kirim pairing code jika athlete
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    if (result.recordset.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Kirim response dengan role
    res.json({
      msg: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pairing_code: user.pairing_code
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Pairing endpoint untuk partner
router.post('/pair', async (req, res) => {
  const { partnerId, pairingCode } = req.body;
  try {
    const pool = await poolPromise;
    
    // Cari athlete dengan pairing code
    const athleteResult = await pool.request()
      .input('pairing_code', sql.NVarChar, pairingCode)
      .query('SELECT id, name FROM users WHERE pairing_code = @pairing_code AND role = \'athlete\'');
    
    if (athleteResult.recordset.length === 0) {
      return res.status(400).json({ msg: 'Invalid pairing code' });
    }
    
    const athlete = athleteResult.recordset[0];
    
    // Update partner dengan athlete_id
    await pool.request()
      .input('partnerId', sql.Int, partnerId)
      .input('athleteId', sql.Int, athlete.id)
      .query('UPDATE users SET athlete_id = @athleteId WHERE id = @partnerId');
    
    res.json({
      msg: 'Pairing successful',
      athlete: {
        id: athlete.id,
        name: athlete.name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;