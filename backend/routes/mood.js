const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Log daily mood
router.post('/log', async (req, res) => {
  const { userId, moodEmoji, moodText } = req.body;
  
  try {
    const pool = await poolPromise;
    
    // Check if user already logged mood today
    const today = new Date().toISOString().split('T')[0];
    const existingMood = await pool.request()
      .input('userId', sql.Int, userId)
      .input('today', sql.Date, today)
      .query('SELECT * FROM mood_logs WHERE user_id = @userId AND created_date = @today');
    
    if (existingMood.recordset.length > 0) {
      // Update existing mood
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('today', sql.Date, today)
        .input('moodEmoji', sql.NVarChar, moodEmoji)
        .input('moodText', sql.NVarChar, moodText || '')
        .query(`
          UPDATE mood_logs 
          SET mood_emoji = @moodEmoji, mood_text = @moodText, created_at = GETDATE()
          WHERE user_id = @userId AND created_date = @today
        `);
    } else {
      // Insert new mood
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('moodEmoji', sql.NVarChar, moodEmoji)
        .input('moodText', sql.NVarChar, moodText || '')
        .query(`
          INSERT INTO mood_logs (user_id, mood_emoji, mood_text, created_date) 
          VALUES (@userId, @moodEmoji, @moodText, GETDATE())
        `);
    }
    
    res.json({ 
      success: true, 
      message: 'Mood logged successfully',
      mood: { emoji: moodEmoji, text: moodText }
    });
  } catch (err) {
    console.error('Error logging mood:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get mood for specific date
router.get('/today/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const pool = await poolPromise;
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('today', sql.Date, today)
      .query('SELECT * FROM mood_logs WHERE user_id = @userId AND created_date = @today');
    
    if (result.recordset.length > 0) {
      res.json({ 
        hasMoodToday: true, 
        mood: result.recordset[0] 
      });
    } else {
      res.json({ 
        hasMoodToday: false, 
        mood: null 
      });
    }
  } catch (err) {
    console.error('Error fetching mood:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get partner's recent moods (for partner dashboard)
router.get('/partner/:partnerId', async (req, res) => {
  const { partnerId } = req.params;
  
  try {
    const pool = await poolPromise;
    
    // Get paired athlete using pairing_code relationship
    // For now, we'll get the first athlete that has registered
    // Later we can implement proper pairing system
    const pairedUser = await pool.request()
      .query(`
        SELECT TOP 1 u.* FROM users u 
        WHERE u.role = 'athlete' 
        ORDER BY u.id ASC
      `);
    
    if (pairedUser.recordset.length === 0) {
      return res.json({ moods: [], message: 'No athlete found' });
    }
    
    const athleteId = pairedUser.recordset[0].id;
    
    // Get recent moods (last 7 days)
    const moods = await pool.request()
      .input('athleteId', sql.Int, athleteId)
      .query(`
        SELECT TOP 7 * FROM mood_logs 
        WHERE user_id = @athleteId 
        ORDER BY created_date DESC
      `);
    
    res.json({ 
      moods: moods.recordset,
      athlete: pairedUser.recordset[0]
    });
  } catch (err) {
    console.error('Error fetching partner moods:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
