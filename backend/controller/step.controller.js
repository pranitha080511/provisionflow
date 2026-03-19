import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const createStep = async (req, res) => 
{
  const { workflow_id } = req.params;
  const { name, step_type, order, metadata } = req.body;
  console.log("Creating Step - Name:", name, "Order:", order, "Metadata Type:", typeof metadata, "Metadata:", metadata);
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO steps (id,workflow_id,name,step_type,"order",metadata,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,NOW(),NOW())
       RETURNING *`,[id, workflow_id, name, step_type, order, JSON.stringify(metadata || {})],);

    // Auto-set start_step_id if workflow doesn't have one
    const wf = await pool.query("SELECT start_step_id FROM workflows WHERE id=$1", [workflow_id]);
    if (wf.rows.length > 0 && !wf.rows[0].start_step_id) {
        await pool.query("UPDATE workflows SET start_step_id=$1 WHERE id=$2", [id, workflow_id]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB Insert Error (Steps):", err);
    res.status(500).json(err.message);
  }
};

export const getSteps = async (req, res) => 
{
  const { workflow_id } = req.params;
  const result = await pool.query(`SELECT * FROM steps WHERE workflow_id=$1 ORDER BY "order"`,[workflow_id],);
  res.json(result.rows);
};

export const updateStep = async (req, res) => 
{
  const { id } = req.params;
  const { name, metadata } = req.body;
  const result = await pool.query(`UPDATE steps SET name=$1,metadata=$2::jsonb,updated_at=NOW() WHERE id=$3
    RETURNING *`,[name, JSON.stringify(metadata || {}), id],);
  res.json(result.rows[0]);
};

export const deleteStep = async (req, res) => 
{
  const { id } = req.params;
  await pool.query("DELETE FROM steps WHERE id=$1", [id]);
  res.json({ message: "Step deleted" });
};
