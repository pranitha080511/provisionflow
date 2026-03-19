import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const createWorkflow = async (req, res) => 
{
  try {
    const { name, input_schema } = req.body;
    console.log("Creating Workflow - Name:", name, "Schema Type:", typeof input_schema, "Schema:", input_schema);
    const id = uuidv4();
    try {
      const result = await pool.query(`INSERT INTO workflows (id,name,version,is_active,input_schema,created_at,updated_at) VALUES ($1,$2,1,true,$3::jsonb,NOW(),NOW())
        RETURNING *`,
        [id, name, JSON.stringify(input_schema || [])],
      );
      res.json(result.rows[0]);
    } catch (dbErr) {
      console.error("DB Insert Error (Workflows):", dbErr.message, "Data:", { id, name, input_schema });
      throw dbErr;
    }
  } catch (err) {
    console.error("Workflow Creation Error:", err.message);
    res.status(500).json(err.message);
  }
};

export const getWorkflows = async (req, res) => 
{
  const result = await pool.query("SELECT * FROM workflows ORDER BY created_at DESC",);
  res.json(result.rows);
};

export const getWorkflowById = async (req, res) => 
{
  const { id } = req.params;
  const workflowResult = await pool.query("SELECT * FROM workflows WHERE id=$1", [id]);
  const workflow = workflowResult.rows[0];
  const steps = await pool.query("SELECT * FROM steps WHERE workflow_id=$1 ORDER BY \"order\" ASC", [id]);
  
  if (workflow && !workflow.start_step_id && steps.rows.length > 0) {
      workflow.start_step_id = steps.rows[0].id;
  }

  const rules = await pool.query(`SELECT r.* FROM rules r JOIN steps s ON r.step_id=s.id WHERE s.workflow_id=$1`,[id],);
  res.json({
    workflow: workflow,
    steps: steps.rows,
    rules: rules.rows,
  });
};

export const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, input_schema, steps } = req.body;

    // 1. Fetch old state to snapshot
    const oldWfResult = await pool.query("SELECT * FROM workflows WHERE id=$1", [id]);
    if (oldWfResult.rows.length === 0) return res.status(404).json("Workflow not found");
    const oldWf = oldWfResult.rows[0];

    const oldStepsRes = await pool.query("SELECT * FROM steps WHERE workflow_id=$1 ORDER BY \"order\" ASC", [id]);
    const oldRulesRes = await pool.query(`SELECT r.* FROM rules r JOIN steps s ON r.step_id=s.id WHERE s.workflow_id=$1`, [id]);

    const oldConfig = {
      version: oldWf.version,
      name: oldWf.name,
      input_schema: oldWf.input_schema,
      updated_at: oldWf.updated_at,
      steps: oldStepsRes.rows.map(s => {
        const stepRules = oldRulesRes.rows.filter(r => r.step_id === s.id);
        return {
          name: s.name,
          type: s.step_type,
          metadata: s.metadata,
          rules: stepRules.map(r => {
            // Find index of next_step_id in oldStepsRes
            const nextIdx = r.next_step_id ? oldStepsRes.rows.findIndex(os => os.id === r.next_step_id) : -1;
            return {
              condition: r.condition,
              next_step_index: nextIdx >= 0 ? nextIdx.toString() : (r.next_step_id ? "id:" + r.next_step_id : "end")
            };
          })
        };
      })
    };

    const historyArray = Array.isArray(oldWf.history) ? oldWf.history : [];
    const newHistory = [oldConfig, ...historyArray];
    const newVersion = oldWf.version + 1;

    // 2. Update workflow row
    const result = await pool.query(
      `UPDATE workflows SET name=$1, input_schema=$2::jsonb, version=$3, updated_at=NOW(), history=$4::jsonb WHERE id=$5 RETURNING *`,
      [name, JSON.stringify(input_schema || []), newVersion, JSON.stringify(newHistory), id]
    );

    // 3. Replace steps and rules if provided in request
    if (steps && Array.isArray(steps)) {
      // Delete old steps (cascades to rules)
      await pool.query("DELETE FROM steps WHERE workflow_id=$1", [id]);
      
      const stepIdsMap = []; // index in request array -> new step UUID
      let startStepId = null;

      // Phase 1: Create all steps
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        const stepId = uuidv4();
        stepIdsMap[i] = stepId;
        if (i === 0) startStepId = stepId;

        await pool.query(
          `INSERT INTO steps (id, workflow_id, name, step_type, "order", metadata, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,NOW(),NOW())`,
          [stepId, id, s.name, s.type || s.step_type || 'task', i + 1, JSON.stringify(s.metadata || {})]
        );
      }

      // Phase 2: Create all rules
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        const stepId = stepIdsMap[i];

        if (s.rules && s.rules.length > 0) {
          for (let j = 0; j < s.rules.length; j++) {
            const rule = s.rules[j];
            let condition = "";
            let nextStepId = null;

            if (typeof rule === 'object' && rule !== null) {
              condition = rule.condition || "DEFAULT";
              if (rule.next_step_index === "end") {
                nextStepId = null;
              } else if (rule.next_step_index !== "" && rule.next_step_index !== undefined) {
                nextStepId = stepIdsMap[parseInt(rule.next_step_index)];
              } else if (rule.next_step_id) {
                // Fallback for cases where direct ID is passed
                nextStepId = rule.next_step_id;
              }
            } else if (typeof rule === 'string') {
              condition = rule;
            }

            if (condition) {
              await pool.query(
                `INSERT INTO rules (id, step_id, condition, next_step_id, priority, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
                [uuidv4(), stepId, condition, nextStepId, j + 1]
              );
            }
          }
        }
      }
      
      if (startStepId) {
        await pool.query("UPDATE workflows SET start_step_id=$1 WHERE id=$2", [startStepId, id]);
        result.rows[0].start_step_id = startStepId;
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Workflow Error:", err);
    res.status(500).json(err.message);
  }
};

export const deleteWorkflow = async (req, res) => 
{
  const { id } = req.params;
  await pool.query("DELETE FROM workflows WHERE id=$1", [id]);
  res.json({ message: "Workflow deleted" });
};

export const restoreWorkflow = async (req, res) => {
  try {
    const { id, version } = req.params;
    const targetVersion = parseInt(version);

    // 1. Fetch current workflow
    const wfResult = await pool.query("SELECT * FROM workflows WHERE id=$1", [id]);
    if (wfResult.rows.length === 0) return res.status(404).json({ message: "Workflow not found" });
    const currentWf = wfResult.rows[0];

    const historyArray = Array.isArray(currentWf.history) ? currentWf.history : [];

    // 2. Find the target version in history
    const targetSnapshot = historyArray.find(h => h.version === targetVersion);
    if (!targetSnapshot) return res.status(404).json({ message: `Version ${targetVersion} not found in history` });

    // 3. Keep current active version in history, remove the restored one
    const currentStepsRes = await pool.query("SELECT * FROM steps WHERE workflow_id=$1 ORDER BY \"order\" ASC", [id]);
    const currentRulesRes = await pool.query("SELECT r.* FROM rules r JOIN steps s ON r.step_id=s.id WHERE s.workflow_id=$1", [id]);

    const currentSnapshot = {
      version: currentWf.version,
      name: currentWf.name,
      input_schema: currentWf.input_schema,
      updated_at: currentWf.updated_at,
      steps: currentStepsRes.rows.map(s => ({
        name: s.name,
        type: s.step_type,
        rules: currentRulesRes.rows.filter(r => r.step_id === s.id).map(r => r.condition)
      }))
    };

    // Remove target version from history, add current version to history
    const newHistory = [
      currentSnapshot,
      ...historyArray.filter(h => h.version !== targetVersion)
    ];

    // 4. Restore — set version to the target version number (not incremented)
    await pool.query(
      "UPDATE workflows SET name=$1, input_schema=$2::jsonb, version=$3, updated_at=NOW(), history=$4::jsonb WHERE id=$5",
      [targetSnapshot.name, JSON.stringify(targetSnapshot.input_schema || []), targetVersion, JSON.stringify(newHistory), id]
    );

    // 5. Replace steps and rules
    await pool.query("DELETE FROM steps WHERE workflow_id=$1", [id]);

    const stepIdsMap = [];
    let startStepId = null;

    if (targetSnapshot.steps && targetSnapshot.steps.length > 0) {
      // Phase 1: Create Steps
      for (let i = 0; i < targetSnapshot.steps.length; i++) {
        const s = targetSnapshot.steps[i];
        const stepId = uuidv4();
        stepIdsMap[i] = stepId;
        if (i === 0) startStepId = stepId;

        await pool.query(
          `INSERT INTO steps (id, workflow_id, name, step_type, "order", metadata, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,NOW(),NOW())`,
          [stepId, id, s.name, s.type || 'task', i + 1, JSON.stringify(s.metadata || {})]
        );
      }

      // Phase 2: Create Rules
      for (let i = 0; i < targetSnapshot.steps.length; i++) {
        const s = targetSnapshot.steps[i];
        const stepId = stepIdsMap[i];

        if (s.rules && s.rules.length > 0) {
          for (let j = 0; j < s.rules.length; j++) {
            const rule = s.rules[j];
            let condition = "";
            let nextStepId = null;

            if (typeof rule === 'object' && rule !== null) {
                condition = rule.condition;
                if (rule.next_step_index === "end") {
                    nextStepId = null;
                } else if (rule.next_step_index && rule.next_step_index.toString().startsWith("id:")) {
                    nextStepId = rule.next_step_index.split(":")[1];
                } else if (rule.next_step_index !== "" && rule.next_step_index !== undefined) {
                    const idx = parseInt(rule.next_step_index);
                    nextStepId = !isNaN(idx) ? stepIdsMap[idx] : null;
                }
            } else {
                condition = rule;
            }

            if (condition && condition.trim()) {
              await pool.query(
                "INSERT INTO rules (id, step_id, condition, next_step_id, priority, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW())",
                [uuidv4(), stepId, condition, nextStepId, j + 1]
              );
            }
          }
        }
      }
    }

    if (startStepId) {
      await pool.query("UPDATE workflows SET start_step_id=$1 WHERE id=$2", [startStepId, id]);
    }

    res.json({ message: `Version ${targetVersion} is now the active version` });
  } catch (err) {
    console.error("Restore Workflow Error:", err);
    res.status(500).json({ message: err.message });
  }
};
