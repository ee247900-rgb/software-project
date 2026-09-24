const { query } = require('../config/db');

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await query('SELECT * FROM SHIFT ORDER BY date DESC, start_time ASC');
    res.json(shifts);
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({ error: 'Failed to fetch shifts.' });
  }
};

// Create new shift
exports.createShift = async (req, res) => {
  try {
    const { shift_type, start_time, date } = req.body;

    if (!shift_type || !start_time || !date) {
      return res.status(400).json({ error: 'Please provide shift type, start time, and date.' });
    }

    const result = await query(
      'INSERT INTO SHIFT (shift_type, start_time, date) VALUES (?, ?, ?)',
      [shift_type.trim(), start_time.trim(), date.trim()]
    );

    res.status(201).json({
      message: 'Shift created successfully',
      shift_id: result.insertId
    });
  } catch (err) {
    console.error('Error creating shift:', err);
    res.status(500).json({ error: 'Failed to create shift.' });
  }
};

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shift_type, start_time, date } = req.body;

    if (!shift_type || !start_time || !date) {
      return res.status(400).json({ error: 'Please provide shift type, start time, and date.' });
    }

    const existing = await query('SELECT shift_id FROM SHIFT WHERE shift_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Shift not found.' });
    }

    await query(
      'UPDATE SHIFT SET shift_type = ?, start_time = ?, date = ? WHERE shift_id = ?',
      [shift_type.trim(), start_time.trim(), date.trim(), id]
    );

    res.json({ message: 'Shift updated successfully.' });
  } catch (err) {
    console.error('Error updating shift:', err);
    res.status(500).json({ error: 'Failed to update shift.' });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT shift_id FROM SHIFT WHERE shift_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Shift not found.' });
    }

    await query('DELETE FROM SHIFT WHERE shift_id = ?', [id]);
    res.json({ message: 'Shift deleted successfully.' });
  } catch (err) {
    console.error('Error deleting shift:', err);
    res.status(500).json({ error: 'Failed to delete shift.' });
  }
};
