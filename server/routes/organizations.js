const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { parent_objid, search } = req.query;

    let query = `
      SELECT
        o.*,
        p.stext as parent_name,
        COUNT(e.pernr) as employee_count
      FROM sap_om o
      LEFT JOIN sap_om p ON o.parent_objid = p.objid
      LEFT JOIN sap_hcm e ON o.objid = e.orgeh
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (parent_objid !== undefined) {
      if (parent_objid === 'null' || parent_objid === '') {
        query += ` AND o.parent_objid IS NULL`;
      } else {
        query += ` AND o.parent_objid = $${paramCount}`;
        params.push(parent_objid);
        paramCount++;
      }
    }

    if (search) {
      query += ` AND (
        LOWER(o.stext) LIKE LOWER($${paramCount}) OR
        LOWER(o.short) LIKE LOWER($${paramCount}) OR
        LOWER(o.objid) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY o.objid, o.otype, o.short, o.stext, o.parent_objid, o.begda, o.endda,
               o.responsible_objid, o.costcenter, o.location, o.org_level, p.stext
               ORDER BY o.objid`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching organizations' });
  }
});

router.get('/tree', authenticateToken, async (req, res) => {
  try {
    const query = `
      WITH RECURSIVE org_tree AS (
        SELECT
          o.*,
          0 as level,
          ARRAY[o.objid] as path
        FROM sap_om o
        WHERE o.parent_objid IS NULL

        UNION ALL

        SELECT
          o.*,
          ot.level + 1,
          ot.path || o.objid
        FROM sap_om o
        JOIN org_tree ot ON o.parent_objid = ot.objid
      )
      SELECT
        ot.*,
        COUNT(e.pernr) as employee_count
      FROM org_tree ot
      LEFT JOIN sap_hcm e ON ot.objid = e.orgeh
      GROUP BY ot.objid, ot.otype, ot.short, ot.stext, ot.parent_objid, ot.begda,
               ot.endda, ot.responsible_objid, ot.costcenter, ot.location,
               ot.org_level, ot.level, ot.path
      ORDER BY ot.path
    `;

    const result = await db.query(query);

    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_objid === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.objid)
        }));
    };

    const tree = buildTree(result.rows);
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching organization tree' });
  }
});

router.get('/:objid',
  authenticateToken,
  param('objid').notEmpty().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { objid } = req.params;

      const query = `
        SELECT
          o.*,
          p.stext as parent_name,
          m.firstname || ' ' || m.lastname as manager_name,
          m.email as manager_email,
          COUNT(DISTINCT e.pernr) as direct_employees,
          COUNT(DISTINCT c.objid) as child_orgs
        FROM sap_om o
        LEFT JOIN sap_om p ON o.parent_objid = p.objid
        LEFT JOIN sap_hcm m ON o.responsible_objid = m.pernr
        LEFT JOIN sap_hcm e ON o.objid = e.orgeh
        LEFT JOIN sap_om c ON o.objid = c.parent_objid
        WHERE o.objid = $1
        GROUP BY o.objid, o.otype, o.short, o.stext, o.parent_objid, o.begda,
                 o.endda, o.responsible_objid, o.costcenter, o.location,
                 o.org_level, p.stext, m.firstname, m.lastname, m.email
      `;

      const result = await db.query(query, [objid]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      const org = result.rows[0];

      const childrenQuery = `
        SELECT objid, short, stext, org_level
        FROM sap_om
        WHERE parent_objid = $1
        ORDER BY objid
      `;
      const childrenResult = await db.query(childrenQuery, [objid]);
      org.children = childrenResult.rows;

      const employeesQuery = `
        SELECT pernr, firstname, lastname, job, email
        FROM sap_hcm
        WHERE orgeh = $1
        ORDER BY lastname, firstname
        LIMIT 10
      `;
      const employeesResult = await db.query(employeesQuery, [objid]);
      org.employees = employeesResult.rows;

      res.json(org);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching organization' });
    }
});

router.put('/:objid',
  authenticateToken,
  [
    param('objid').notEmpty().trim().escape(),
    body('stext').optional().trim().escape(),
    body('short').optional().trim().escape(),
    body('otype').optional().trim().escape(),
    body('parent_objid').optional().trim().escape(),
    body('begda').optional().trim(),
    body('endda').optional().trim(),
    body('responsible_objid').optional().trim().escape(),
    body('costcenter').optional().trim().escape(),
    body('location').optional().trim().escape(),
    body('org_level').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { objid } = req.params;
      const updates = req.body;

      const allowedFields = [
        'stext', 'short', 'otype', 'parent_objid', 'begda', 'endda',
        'responsible_objid', 'costcenter', 'location', 'org_level'
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

      updateValues.push(objid);

      const query = `
        UPDATE sap_om
        SET ${updateFields.join(', ')}
        WHERE objid = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, updateValues);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating organization' });
    }
});

// Create new organization
router.post('/',
  authenticateToken,
  [
    body('objid').notEmpty().trim().escape(),
    body('stext').notEmpty().trim().escape(),
    body('short').notEmpty().trim().escape(),
    body('otype').optional().trim().escape(),
    body('parent_objid').optional().trim().escape(),
    body('begda').notEmpty().trim(),
    body('endda').notEmpty().trim(),
    body('responsible_objid').optional().trim().escape(),
    body('costcenter').optional().trim().escape(),
    body('location').optional().trim().escape(),
    body('org_level').notEmpty().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        objid, stext, short, otype, parent_objid, begda, endda,
        responsible_objid, costcenter, location, org_level
      } = req.body;

      // Check if organization with this objid already exists
      const checkQuery = 'SELECT objid FROM sap_om WHERE objid = $1';
      const checkResult = await db.query(checkQuery, [objid]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ message: 'Organization with this Object ID already exists' });
      }

      // Validate parent organization exists if provided
      if (parent_objid) {
        const parentQuery = 'SELECT objid FROM sap_om WHERE objid = $1';
        const parentResult = await db.query(parentQuery, [parent_objid]);
        if (parentResult.rows.length === 0) {
          return res.status(400).json({ message: 'Parent organization does not exist' });
        }
      }

      const insertQuery = `
        INSERT INTO sap_om (
          objid, otype, short, stext, parent_objid, begda, endda,
          responsible_objid, costcenter, location, org_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        objid,
        otype || 'O',
        short,
        stext,
        parent_objid || null,
        begda,
        endda,
        responsible_objid || null,
        costcenter || null,
        location || null,
        org_level
      ];

      const result = await db.query(insertQuery, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating organization:', err);
      res.status(500).json({ message: 'Error creating organization' });
    }
  }
);

// Delete organization
router.delete('/:objid',
  authenticateToken,
  param('objid').notEmpty().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { objid } = req.params;

      // Check if organization exists
      const checkQuery = 'SELECT objid FROM sap_om WHERE objid = $1';
      const checkResult = await db.query(checkQuery, [objid]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // Check if organization has child organizations
      const childrenQuery = 'SELECT COUNT(*) as count FROM sap_om WHERE parent_objid = $1';
      const childrenResult = await db.query(childrenQuery, [objid]);

      if (parseInt(childrenResult.rows[0].count) > 0) {
        return res.status(400).json({
          message: 'Cannot delete organization with child organizations. Please delete child organizations first.'
        });
      }

      // Check if organization has employees assigned
      const employeesQuery = 'SELECT COUNT(*) as count FROM sap_hcm WHERE orgeh = $1';
      const employeesResult = await db.query(employeesQuery, [objid]);

      if (parseInt(employeesResult.rows[0].count) > 0) {
        return res.status(400).json({
          message: 'Cannot delete organization with assigned employees. Please reassign employees first.'
        });
      }

      // Delete organization
      const deleteQuery = 'DELETE FROM sap_om WHERE objid = $1 RETURNING *';
      const deleteResult = await db.query(deleteQuery, [objid]);

      res.json({
        message: 'Organization deleted successfully',
        deletedOrganization: deleteResult.rows[0]
      });
    } catch (err) {
      console.error('Error deleting organization:', err);
      res.status(500).json({ message: 'Error deleting organization' });
    }
  }
);

module.exports = router;