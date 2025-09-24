const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');
const { generateRealisticEmployee } = require('../utils/employeeGenerator');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { orgeh, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        e.*,
        o.stext as org_name,
        o.short as org_short
      FROM sap_hcm e
      LEFT JOIN sap_om o ON e.orgeh = o.objid
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (orgeh) {
      query += ` AND e.orgeh = $${paramCount}`;
      params.push(orgeh);
      paramCount++;
    }

    if (search) {
      query += ` AND (
        LOWER(e.firstname) LIKE LOWER($${paramCount}) OR
        LOWER(e.lastname) LIKE LOWER($${paramCount}) OR
        LOWER(e.pernr) LIKE LOWER($${paramCount}) OR
        LOWER(e.email) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Create a proper count query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM sap_hcm e
      LEFT JOIN sap_om o ON e.orgeh = o.objid
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 1;

    if (orgeh) {
      countQuery += ` AND e.orgeh = $${countParamCount}`;
      countParams.push(orgeh);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (
        LOWER(e.firstname) LIKE LOWER($${countParamCount}) OR
        LOWER(e.lastname) LIKE LOWER($${countParamCount}) OR
        LOWER(e.pernr) LIKE LOWER($${countParamCount}) OR
        LOWER(e.email) LIKE LOWER($${countParamCount})
      )`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    const countResult = await db.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].total);

    query += ` ORDER BY e.pernr LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRecords,
        pages: Math.ceil(totalRecords / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Generate sample employee data (for testing purposes)
router.get('/generate-sample',
  authenticateToken,
  async (req, res) => {
    try {
      // Get available organizations for realistic assignment
      const orgsQuery = 'SELECT objid, stext FROM sap_om ORDER BY objid LIMIT 50';
      const orgsResult = await db.query(orgsQuery);
      const availableOrgs = orgsResult.rows;

      // Generate sample employee
      const sampleEmployee = generateRealisticEmployee(availableOrgs);

      res.json({
        message: 'Sample employee data generated',
        employee: sampleEmployee,
        note: 'Use this data to test the employee creation form'
      });
    } catch (err) {
      console.error('Error generating sample employee:', err);
      res.status(500).json({ message: 'Error generating sample employee' });
    }
  }
);

router.get('/:pernr',
  authenticateToken,
  param('pernr').notEmpty().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { pernr } = req.params;

      const query = `
        SELECT
          e.*,
          o.stext as org_name,
          o.short as org_short,
          o.parent_objid,
          o.responsible_objid,
          o.costcenter,
          o.org_level
        FROM sap_hcm e
        LEFT JOIN sap_om o ON e.orgeh = o.objid
        WHERE e.pernr = $1
      `;

      const result = await db.query(query, [pernr]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const employee = result.rows[0];

      if (employee.parent_pernr && employee.parent_pernr !== employee.pernr) {
        const contractsQuery = `
          SELECT pernr, begda, endda, contract_type, workschedule
          FROM sap_hcm
          WHERE parent_pernr = $1
          ORDER BY begda DESC
        `;
        const contractsResult = await db.query(contractsQuery, [employee.parent_pernr]);
        employee.contracts = contractsResult.rows;
      }

      res.json(employee);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching employee' });
    }
});

router.put('/:pernr',
  authenticateToken,
  [
    param('pernr').notEmpty().trim().escape(),
    body('firstname').optional().trim().escape(),
    body('lastname').optional().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim().escape(),
    body('location').optional().trim().escape(),
    body('orgeh').optional().trim().escape(),
    body('job').optional().trim().escape(),
    body('plans').optional().trim().escape(),
    body('contract_type').optional().trim().escape(),
    body('workschedule').optional().trim().escape(),
    body('birthdate').optional().trim().escape(),
    body('gender').optional().trim().escape(),
    body('natio').optional().trim().escape(),
    body('persg').optional().trim().escape(),
    body('persk').optional().trim().escape(),
    body('begda').optional().trim().escape(),
    body('endda').optional().trim().escape(),
    body('title').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { pernr } = req.params;
      const updates = req.body;

      const allowedFields = [
        'firstname', 'lastname', 'email', 'phone', 'location', 'orgeh', 'job', 'plans', 'title',
        'contract_type', 'workschedule', 'birthdate', 'gender', 'natio', 'persg', 'persk', 'begda', 'endda'
      ];
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = $${paramCount}`);
          updateValues.push(value);
          paramCount++;
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }

      updateValues.push(pernr);

      const query = `
        UPDATE sap_hcm
        SET ${updateFields.join(', ')}
        WHERE pernr = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, updateValues);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating employee' });
    }
});

router.post('/',
  authenticateToken,
  [
    body('firstname').notEmpty().trim().escape(),
    body('lastname').notEmpty().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('orgeh').notEmpty().trim().escape(),
    body('begda').notEmpty().trim(),
    body('endda').notEmpty().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        firstname, lastname, email, phone, orgeh,
        plans, job, begda, endda, birthdate, gender, natio,
        persg, persk, workschedule, contract_type, location, title
      } = req.body;

      // Generate next personnel number starting from 30000
      const maxPernrQuery = 'SELECT MAX(CAST(pernr AS INTEGER)) as max_pernr FROM sap_hcm WHERE pernr ~ \'^[0-9]+$\'';
      const maxPernrResult = await db.query(maxPernrQuery);
      let nextPernr = 30000;

      if (maxPernrResult.rows[0].max_pernr) {
        const maxPernr = parseInt(maxPernrResult.rows[0].max_pernr);
        nextPernr = Math.max(30000, maxPernr + 1);
      }

      const pernr = nextPernr.toString();

      const insertQuery = `
        INSERT INTO sap_hcm (
          pernr, firstname, lastname, email, phone, orgeh,
          plans, job, begda, endda, birthdate, gender, natio,
          persg, persk, workschedule, contract_type, location, title, parent_pernr
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $1)
        RETURNING *
      `;

      const values = [
        pernr, firstname, lastname, email, phone, orgeh,
        plans, job, begda, endda, birthdate, gender, natio,
        persg, persk, workschedule, contract_type, location, title
      ];

      const result = await db.query(insertQuery, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating employee' });
    }
});

module.exports = router;