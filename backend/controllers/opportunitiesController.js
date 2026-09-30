const db = require('../config/db');

const REQUIRED_FIELDS = [
  'title',
  'description',
  'research_area',
  'faculty_name',
  'department',
  'required_skills',
  'positions_available',
  'application_deadline'
];

function validateOpportunity(body, { partial = false } = {}) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!partial || Object.prototype.hasOwnProperty.call(body, field)) {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`"${field}" is required.`);
      }
    }
  }

  if (body.positions_available !== undefined && body.positions_available !== '') {
    const positions = Number(body.positions_available);
    if (!Number.isInteger(positions) || positions < 1) {
      errors.push('"positions_available" must be a whole number of 1 or more.');
    }
  }

  if (body.application_deadline !== undefined && body.application_deadline !== '') {
    const date = new Date(body.application_deadline);
    if (Number.isNaN(date.getTime())) {
      errors.push('"application_deadline" must be a valid date (YYYY-MM-DD).');
    }
  }

  if (body.status !== undefined && !['Open', 'Closed'].includes(body.status)) {
    errors.push('"status" must be either "Open" or "Closed".');
  }

  return errors;
}

// POST /api/opportunities
exports.createOpportunity = async (req, res) => {
  try {
    const errors = validateOpportunity(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      positions_available,
      application_deadline,
      status = 'Open'
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO opportunities
        (title, description, research_area, faculty_name, department, required_skills, positions_available, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, research_area, faculty_name, department, required_skills, positions_available, application_deadline, status]
    );

    const [rows] = await db.query('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error while creating opportunity.' });
  }
};

// GET /api/opportunities
exports.getAllOpportunities = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM opportunities ORDER BY created_at DESC');
    return res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error while fetching opportunities.' });
  }
};

// GET /api/opportunities/:id
exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM opportunities WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `No opportunity found with id ${id}.` });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error while fetching opportunity.' });
  }
};

// PUT /api/opportunities/:id
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `No opportunity found with id ${id}.` });
    }

    const errors = validateOpportunity(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const current = existing[0];
    const updated = {
      title: req.body.title ?? current.title,
      description: req.body.description ?? current.description,
      research_area: req.body.research_area ?? current.research_area,
      faculty_name: req.body.faculty_name ?? current.faculty_name,
      department: req.body.department ?? current.department,
      required_skills: req.body.required_skills ?? current.required_skills,
      positions_available: req.body.positions_available ?? current.positions_available,
      application_deadline: req.body.application_deadline ?? current.application_deadline,
      status: req.body.status ?? current.status
    };

    await db.query(
      `UPDATE opportunities SET
        title = ?, description = ?, research_area = ?, faculty_name = ?, department = ?,
        required_skills = ?, positions_available = ?, application_deadline = ?, status = ?
       WHERE id = ?`,
      [
        updated.title,
        updated.description,
        updated.research_area,
        updated.faculty_name,
        updated.department,
        updated.required_skills,
        updated.positions_available,
        updated.application_deadline,
        updated.status,
        id
      ]
    );

    const [rows] = await db.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error while updating opportunity.' });
  }
};

// DELETE /api/opportunities/:id
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `No opportunity found with id ${id}.` });
    }

    await db.query('DELETE FROM opportunities WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: `Opportunity ${id} deleted successfully.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error while deleting opportunity.' });
  }
};
