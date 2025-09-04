const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Add new schedule
router.post('/add', async (req, res) => {
  const { userId, scheduleDate, startTime, endTime, activityDescription } = req.body;
  
  console.log('Received schedule data:', {
    userId,
    scheduleDate,
    startTime,
    endTime,
    activityDescription
  });
  
  try {
    const pool = await poolPromise;
    
    // Format time sebagai string sederhana
    const formattedStartTime = startTime + ':00';
    const formattedEndTime = endTime + ':00';
    
    console.log('Formatted times:', { formattedStartTime, formattedEndTime });
    
    // Gunakan query sederhana tanpa parameter untuk time
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('scheduleDate', sql.Date, scheduleDate)
      .input('activityDescription', sql.NVarChar, activityDescription)
      .query(`
        INSERT INTO daily_schedules (user_id, schedule_date, start_time, end_time, activity_description) 
        VALUES (${userId}, '${scheduleDate}', '${formattedStartTime}', '${formattedEndTime}', N'${activityDescription.replace(/'/g, "''")}')
      `);
    
    res.json({ 
      success: true, 
      message: 'Schedule added successfully'
    });
  } catch (err) {
    console.error('Error adding schedule:', err);
    console.error('Full error details:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get schedules for specific date
router.get('/date/:userId/:date', async (req, res) => {
  const { userId, date } = req.params;
  
  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('date', sql.Date, date)
      .query(`
        SELECT * FROM daily_schedules 
        WHERE user_id = @userId AND schedule_date = @date 
        ORDER BY start_time ASC
      `);
    
    res.json({ 
      schedules: result.recordset 
    });
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get today's schedules
router.get('/today/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const pool = await poolPromise;
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('today', sql.Date, today)
      .query(`
        SELECT * FROM daily_schedules 
        WHERE user_id = @userId AND schedule_date = @today 
        ORDER BY start_time ASC
      `);
    
    console.log('Raw schedule data from DB:', result.recordset);
    
    // Format the time fields properly - handle timezone correctly
    const formattedSchedules = result.recordset.map(schedule => {
      let formattedStartTime = schedule.start_time;
      let formattedEndTime = schedule.end_time;
      
      if (schedule.start_time instanceof Date) {
        // Use UTC methods to avoid timezone issues
        const startHours = schedule.start_time.getUTCHours().toString().padStart(2, '0');
        const startMinutes = schedule.start_time.getUTCMinutes().toString().padStart(2, '0');
        formattedStartTime = `${startHours}:${startMinutes}:00`;
      }
      
      if (schedule.end_time instanceof Date) {
        // Use UTC methods to avoid timezone issues
        const endHours = schedule.end_time.getUTCHours().toString().padStart(2, '0');
        const endMinutes = schedule.end_time.getUTCMinutes().toString().padStart(2, '0');
        formattedEndTime = `${endHours}:${endMinutes}:00`;
      }
      
      return {
        ...schedule,
        start_time: formattedStartTime,
        end_time: formattedEndTime
      };
    });
    
    console.log('Formatted schedule data:', formattedSchedules);
    
    res.json({ 
      schedules: formattedSchedules 
    });
  } catch (err) {
    console.error('Error fetching today schedules:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark schedule as completed
router.put('/complete/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  
  try {
    const pool = await poolPromise;
    
    await pool.request()
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        UPDATE daily_schedules 
        SET is_completed = 1, completed_at = GETDATE() 
        WHERE id = @scheduleId
      `);
    
    res.json({ 
      success: true, 
      message: 'Schedule marked as completed'
    });
  } catch (err) {
    console.error('Error completing schedule:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all schedules for a user (for schedule management)
router.get('/all/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT * FROM daily_schedules 
        WHERE user_id = @userId 
        ORDER BY schedule_date DESC, start_time ASC
      `);
    
    res.json({ 
      schedules: result.recordset 
    });
  } catch (err) {
    console.error('Error fetching all schedules:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get today's schedules for an athlete (for partner monitoring)
router.get('/athlete/:athleteId/today', async (req, res) => {
  const { athleteId } = req.params;
  
  try {
    const pool = await poolPromise;
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.request()
      .input('athleteId', sql.Int, athleteId)
      .input('today', sql.Date, today)
      .query(`
        SELECT * FROM daily_schedules 
        WHERE user_id = @athleteId AND schedule_date = @today 
        ORDER BY start_time ASC
      `);
    
    console.log('Raw athlete schedule data from DB:', result.recordset);
    
    // Format the time fields properly - handle timezone correctly
    const formattedSchedules = result.recordset.map(schedule => {
      let formattedStartTime = schedule.start_time;
      let formattedEndTime = schedule.end_time;
      
      if (schedule.start_time instanceof Date) {
        // Use UTC methods to avoid timezone issues
        const startHours = schedule.start_time.getUTCHours().toString().padStart(2, '0');
        const startMinutes = schedule.start_time.getUTCMinutes().toString().padStart(2, '0');
        formattedStartTime = `${startHours}:${startMinutes}:00`;
      }
      
      if (schedule.end_time instanceof Date) {
        // Use UTC methods to avoid timezone issues
        const endHours = schedule.end_time.getUTCHours().toString().padStart(2, '0');
        const endMinutes = schedule.end_time.getUTCMinutes().toString().padStart(2, '0');
        formattedEndTime = `${endHours}:${endMinutes}:00`;
      }
      
      return {
        ...schedule,
        start_time: formattedStartTime,
        end_time: formattedEndTime
      };
    });
    
    console.log('Formatted athlete schedule data:', formattedSchedules);
    
    res.json(formattedSchedules);
  } catch (err) {
    console.error('Error fetching athlete schedules:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete schedule
router.delete('/delete/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  
  try {
    const pool = await poolPromise;
    
    await pool.request()
      .input('scheduleId', sql.Int, scheduleId)
      .query('DELETE FROM daily_schedules WHERE id = @scheduleId');
    
    res.json({ 
      success: true, 
      message: 'Schedule deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
