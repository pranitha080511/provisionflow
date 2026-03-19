import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../config/mail.js";

// Helper for rule evaluation
const evaluateCondition = (condition, data) => {
  if (!condition) return true;
  if (condition === "DEFAULT") return "DEFAULT";
  
  let cleanedCondition = condition;
  // Handle various arrow variations (→, =>, ->, etc.)
  ['→', '=>', '->', 'ΓåÆ'].forEach(arrow => {
    if (cleanedCondition.includes(arrow)) {
      cleanedCondition = cleanedCondition.split(arrow)[0].trim();
    }
  });

  try {
    const sandbox = new Proxy(data, {
      has: () => true,
      get: (target, prop) => {
        if (typeof prop === 'symbol') return target[prop];
        if (prop in target) return target[prop];
        return String(prop);
      }
    });

    const evaluate = new Function('sandbox', `
      with(sandbox) {
        try {
          return ${cleanedCondition};
        } catch(e) {
          return false;
        }
      }
    `);

    return evaluate(sandbox) === true;
  } catch (err) {
    console.log("Rule evaluation error (syntax):", err);
    return false;
  }
};

const renderStatusPage = (title, message, type = 'success') => {
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';
  const primaryColor = isSuccess ? '#10b981' : (isWarning ? '#f59e0b' : '#ef4444');
  const bgColor = isSuccess ? '#f0fdf4' : (isWarning ? '#fffbeb' : '#fef2f2');
  const iconMarkup = isSuccess 
    ? `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`
    : (isWarning ? `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>` : `<circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/>`);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | HalleyX</title>
        <style>
            body { 
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
                background: linear-gradient(135deg, #1a1c2c 0%, #11121d 100%); 
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0; 
            }
            .card { 
                background: rgba(255, 255, 255, 0.05); 
                backdrop-filter: blur(20px); 
                border: 1px solid rgba(255, 255, 255, 0.1); 
                padding: 3rem; 
                border-radius: 24px; 
                text-align: center; 
                max-width: 450px; 
                width: 90%; 
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); 
                animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .icon-wrapper { 
                width: 80px; height: 80px; background: ${primaryColor}20; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; 
            }
            .icon { width: 48px; height: 48px; color: ${primaryColor}; }
            h1 { margin: 0 0 1rem; font-size: 2rem; font-weight: 800; background: linear-gradient(to right, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            p { color: #9ca3af; line-height: 1.6; font-size: 1.1rem; margin-bottom: 2rem; }
            .btn { 
                display: inline-block; background: linear-gradient(135deg, #6b46c1 0%, #d53f8c 100%); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(107, 70, 193, 0.3);
            }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(107, 70, 193, 0.5); }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">${iconMarkup}</svg>
            </div>
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="http://localhost:3000" class="btn">Go to Dashboard</a>
        </div>
    </body>
    </html>
  `;
};

// Core Execution Function
const runWorkflowLoop = async (executionId, workflowId, workflowVersion, startStepId, initialData, initialLogs, workflowName, requesterName, requesterEmail) => {
  let currentStepId = startStepId;
  let data = initialData;
  let logs = initialLogs;
  let status = "in_progress";

  while (currentStepId) {
    const stepResult = await pool.query("SELECT * FROM steps WHERE id=$1", [currentStepId]);
    if (stepResult.rows.length === 0) throw new Error("Step not found");
    const step = stepResult.rows[0];

    const stepLog = {
      step_name: step.name,
      step_type: step.step_type,
      status: "processing",
      next_step: null
    };

    // APPROVAL STEP
    if (step.step_type === "approval") {
      if (step.metadata?.collectEmail && step.metadata?.email) {
        const inputSummaryRows = Object.entries(data).map(([k, v]) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">${k}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${v}</td>
          </tr>
        `).join("");

        const mailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #6b46c1 0%, #d53f8c 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">Approval Required</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Workflow: ${workflowName || 'Workflow Request'}</p>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello,</p>
              <p style="color: #666; line-height: 1.6;">User <strong>${requesterName || 'A user'}</strong> has submitted a request that requires your review in the <strong>${step.name}</strong> step.</p>
              
              <div style="margin: 30px 0; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <h3 style="margin-top: 0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Submitted Data</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  ${inputSummaryRows}
                </table>
              </div>

              <div style="margin-top: 30px; text-align: center; gap: 15px; display: flex; justify-content: center;">
                <a href="http://localhost:5000/api/executions/${executionId}/respond?decision=approved" 
                   style="display: inline-block; background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                   Approve Request
                </a>
                <a href="http://localhost:5000/api/executions/${executionId}/respond?decision=rejected" 
                   style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                   Decline Request
                </a>
              </div>
              
              <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
                This is an automated notification from HalleyX Workflow Engine.
              </p>
            </div>
          </div>
        `;

        console.log(`[EMAIL] Sending Approval Request to: ${step.metadata.email}`);
        await sendEmail({
          to: step.metadata.email,
          subject: `[Approval Required] ${workflowName || 'Workflow'} - ${step.name}`,
          html: mailHtml,
          text: `Approval Required for ${workflowName}. Approve at http://localhost:5000/api/executions/${executionId}/respond?decision=approved`
        }).catch(err => console.error("Email send failed:", err));
        
        stepLog.email_sent_to = step.metadata.email;
      }

      stepLog.status = "waiting";
      logs.push(stepLog);

      await pool.query(
        `UPDATE executions SET status='waiting', logs=$1::jsonb, current_step_id=$2, data=$3::jsonb WHERE id=$4`,
        [JSON.stringify(logs), step.id, JSON.stringify(data), executionId]
      );
      return { status: "waiting", executionId };
    }

    // NOTIFICATION STEP
    if (step.step_type === "notification") {
      const targetEmail = requesterEmail; 
      if (targetEmail) {
        console.log(`[EMAIL] Sending Notification to: ${targetEmail}`);
        const notificationSubject = step.metadata?.emailSubject || `Update: ${workflowName} - ${step.name}`;
        const notificationBody = step.metadata?.emailBody || `The workflow "${workflowName}" has progressed to the "${step.name}" stage.`;
        
        const notificationHtml = `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Workflow Update</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">${workflowName}</p>
            </div>
            <div style="padding: 35px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${requesterName || 'User'}</strong>,</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 15px;">${notificationBody}</p>
              </div>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This is an automated notification to keep you updated on the progress of your request.</p>
              <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
                <a href="http://localhost:3000" style="display: inline-block; color: #6366f1; text-decoration: none; font-weight: 600; font-size: 14px;">View in Dashboard →</a>
              </div>
            </div>
          </div>
        `;

        await sendEmail({
          to: targetEmail,
          subject: notificationSubject,
          html: notificationHtml,
          text: `Update: ${workflowName} - ${step.name}. ${notificationBody}`
        }).catch(err => console.error("Notification email failed:", err));
        stepLog.email_sent_to = targetEmail;
      }
    }

    // Rules & Next Step
    const ruleResult = await pool.query("SELECT * FROM rules WHERE step_id=$1 ORDER BY priority ASC", [step.id]);
    const rules = ruleResult.rows;
    console.log(`[EXECUTION] Step: ${step.name} (${step.step_type}), Rules found: ${rules.length}`);
    let nextStep = null;
    let matched = false;
    let defaultStepId = null;

    for (const rule of rules) {
      const evalResult = evaluateCondition(rule.condition, data);
      console.log(`[EXECUTION] Evaluating Rule: "${rule.condition}", Result: ${evalResult}`);
      if (evalResult === "DEFAULT") {
        defaultStepId = rule.next_step_id;
      } else if (evalResult === true) {
        nextStep = rule.next_step_id;
        matched = true;
        break;
      }
    }

    if (!matched && defaultStepId) {
      nextStep = defaultStepId;
      matched = true;
    }

    // Fallback to order - ONLY if no rules are defined for this step at all
    if (!matched && rules.length === 0 && (step.step_type === "task" || step.step_type === "notification")) {
      console.log(`[EXECUTION] No rules defined for ${step.name}, falling back to next step by order`);
      const fallback = await pool.query('SELECT id FROM steps WHERE workflow_id=$1 AND "order" > $2 ORDER BY "order" ASC LIMIT 1', [workflowId, step.order]);
      if (fallback.rows.length > 0) {
        nextStep = fallback.rows[0].id;
        matched = true;
      }
    }

    console.log(`[EXECUTION] Step Match Result: matched=${matched}, nextStep=${nextStep}`);

    if (!matched && step.step_type !== "notification") {
      stepLog.status = "failed";
      logs.push(stepLog);
      
      // Notify requester of failure
      if (requesterEmail) {
        console.log(`[EMAIL] Failure Notification Sent to: ${requesterEmail}`);
        await sendEmail({
          to: requesterEmail,
          subject: `Workflow Halted: ${workflowName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #fecaca;">
              <div style="background-color: #ef4444; padding: 25px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 20px;">Requirement Not Met</h1>
              </div>
              <div style="padding: 30px; background-color: #fff;">
                <p style="font-size: 16px; color: #333;">Hello <strong>${requesterName || 'User'}</strong>,</p>
                <p style="color: #666; line-height: 1.6;">Your request in <strong>${workflowName}</strong> has been stopped at the <strong>${step.name}</strong> stage because the data submitted did not match the required validation rules.</p>
                <div style="margin: 20px 0; padding: 15px; background: #fff5f5; border-radius: 8px; border-left: 4px solid #ef4444;">
                   <p style="margin: 0; font-weight: bold; color: #991b1b; font-size: 14px;">Reason:</p>
                   <p style="margin: 5px 0 0; color: #b91c1c; font-size: 14px;">Data validation failed at ${step.name}.</p>
                </div>
                <p style="margin-top: 25px; font-size: 13px; color: #9ca3af;">Please review your submission and try again if necessary.</p>
              </div>
            </div>
          `,
          text: `Hello ${requesterName || 'User'},\n\nYour request in "${workflowName}" has been stopped at "${step.name}" because the data did not match required rules.`
        }).catch(err => console.error("Failure email failed:", err));
      }

      await pool.query(`UPDATE executions SET status='failed', logs=$1::jsonb, ended_at=NOW() WHERE id=$2`, [JSON.stringify(logs), executionId]);
      return { status: "failed", executionId };
    }

    stepLog.status = "completed";
    stepLog.next_step = nextStep;
    logs.push(stepLog);
    currentStepId = nextStep;
  }

  await pool.query(`UPDATE executions SET status='completed', logs=$1::jsonb, current_step_id=null, ended_at=NOW() WHERE id=$2`, [JSON.stringify(logs), executionId]);
  return { status: "completed", executionId };
};

export const executeWorkflow = async (req, res) => {
  try {
    const { workflow_id } = req.params;
    const bodyData = req.body;
    const sourceData = bodyData.input_data || bodyData;
    const data = {};
    Object.keys(sourceData).forEach(key => {
      const val = sourceData[key];
      data[key] = !isNaN(val) && val !== "" && typeof val !== "object" ? Number(val) : val;
    });

    const workflowRes = await pool.query("SELECT * FROM workflows WHERE id=$1", [workflow_id]);
    if (workflowRes.rows.length === 0) return res.status(404).json({ message: "Workflow not found" });
    const workflow = workflowRes.rows[0];

    const executionId = uuidv4();
    const requesterName = req.user?.name || "Client User";
    const requesterEmail = req.user?.email || "client@halleyx.com";

    await pool.query(
      `INSERT INTO executions (id, workflow_id, workflow_version, status, data, logs, started_at, requester_name, requester_email) 
       VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,NOW(),$7,$8)`, 
      [executionId, workflow_id, workflow.version, 'in_progress', JSON.stringify(data), JSON.stringify([]), requesterName, requesterEmail]
    );

    const result = await runWorkflowLoop(executionId, workflow_id, workflow.version, workflow.start_step_id, data, [], workflow.name, requesterName, requesterEmail);
    res.json(result);
  } catch (error) {
    console.error("Execution Error:", error);
    res.status(500).json({ message: "Execution failed", error: error.message });
  }
};

export const respondToApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const decision = req.query.decision || req.body.decision; // Support both for simplicity

    const executionRes = await pool.query("SELECT * FROM executions WHERE id=$1", [id]);
    if (executionRes.rows.length === 0) return res.status(404).send(renderStatusPage("Not Found", "The request you are looking for does not exist or has been removed.", "error"));
    
    const execution = executionRes.rows[0];

    if (execution.status !== 'waiting') return res.status(200).send(renderStatusPage("Processed", `This request has already been ${execution.status}.`, "warning"));

    const stepRes = await pool.query("SELECT * FROM steps WHERE id=$1", [execution.current_step_id]);
    if (stepRes.rows.length === 0) return res.status(404).send("Current step not found in workflow.");
    const step = stepRes.rows[0];

    let logs = Array.isArray(execution.logs) ? execution.logs : [];
    const lastLog = logs[logs.length - 1];

    if (decision === 'rejected') {
      if (lastLog) {
          lastLog.status = "rejected";
          lastLog.rejected_at = new Date();
      }
      
      const targetEmail = execution.requester_email || "client@halleyx.com";
      if (targetEmail) {
          console.log(`[EMAIL] Result Notification (REJECTED) Sent to: ${targetEmail}`);
          await sendEmail({
            to: targetEmail,
            subject: `Update: Request Declined - ${step.name}`,
            html: `
              <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #ef4444; padding: 30px; text-align: center; color: white;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Request Declined</h1>
                  <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Stage: ${step.name}</p>
                </div>
                <div style="padding: 35px; background-color: #ffffff;">
                  <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${execution.requester_name || 'User'}</strong>,</p>
                  <p style="color: #475569; line-height: 1.6; font-size: 15px;">We regret to inform you that your request in the <strong>${step.name}</strong> stage has been declined.</p>
                  <div style="margin: 25px 0; padding: 20px; background-color: #fef2f2; border-radius: 12px; border: 1px solid #fee2e2;">
                    <p style="margin: 0; color: #b91c1c; font-size: 14px;">If you believe this is an error or have additional information to provide, please contact your administrator or submit a new request with the corrected details.</p>
                  </div>
                  <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; pt: 20px;">
                    This is an automated decision notification from HalleyX.
                  </p>
                </div>
              </div>
            `,
            text: `Hello ${execution.requester_name || 'User'},\n\nYour request in "${step.name}" has been declined.`
          }).catch(err => console.error("Rejection email failed:", err));
      }

      await pool.query("UPDATE executions SET status='failed', logs=$1::jsonb, ended_at=NOW() WHERE id=$2", [JSON.stringify(logs), id]);
      return res.send(renderStatusPage("Declined", "The request has been successfully rejected. The requester will be notified.", 'error'));
    }

    // Approved logic
    if (lastLog) {
        lastLog.status = "completed";
        lastLog.approved_at = new Date();
    }

    const targetEmail = execution.requester_email || "client@halleyx.com";
    if (targetEmail) {
        console.log(`[EMAIL] Result Notification (APPROVED) Sent to: ${targetEmail}`);
        await sendEmail({
          to: targetEmail,
          subject: `Update: Request Approved! - ${step.name}`,
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #dcfce7; border-radius: 16px; overflow: hidden;">
              <div style="background-color: #10b981; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Request Approved</h1>
                <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Great news! Your request has passed the ${step.name} stage.</p>
              </div>
              <div style="padding: 35px; background-color: #ffffff;">
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${execution.requester_name || 'User'}</strong>,</p>
                <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                  <p style="margin: 0; color: #166534; line-height: 1.6; font-size: 15px;">Your request has been officially <strong>approved</strong> at the <strong>${step.name}</strong> stage. The workflow will now automatically proceed to the next step.</p>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">No further action is required from you at this time.</p>
                <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
                  <a href="http://localhost:3000" style="display: inline-block; color: #10b981; text-decoration: none; font-weight: 600; font-size: 14px;">Track Progress →</a>
                </div>
              </div>
            </div>
          `,
          text: `Hello ${execution.requester_name || 'User'},\n\nYour request in "${step.name}" has been approved. The workflow will now continue.`
        }).catch(err => console.error("Approval email failed:", err));
    }

    // Continue from next step
    // We need to find the nextStep for the approval step
    const ruleResult = await pool.query("SELECT * FROM rules WHERE step_id=$1 ORDER BY priority ASC", [step.id]);
    const rules = ruleResult.rows;
    let nextStepId = null;
    let matched = false;
    let defaultStepId = null;

    for (const rule of rules) {
      const evalResult = evaluateCondition(rule.condition, execution.data);
      if (evalResult === "DEFAULT") defaultStepId = rule.next_step_id;
      else if (evalResult === true) { nextStepId = rule.next_step_id; matched = true; break; }
    }
    if (!matched) nextStepId = defaultStepId;
    
    // Fallback if still no next step
    if (!nextStepId) {
       const fallback = await pool.query('SELECT id FROM steps WHERE workflow_id=$1 AND "order" > $2 ORDER BY "order" ASC LIMIT 1', [execution.workflow_id, step.order]);
       if (fallback.rows.length > 0) nextStepId = fallback.rows[0].id;
    }

    const workflowRes = await pool.query("SELECT name FROM workflows WHERE id=$1", [execution.workflow_id]);
    const workflowName = workflowRes.rows[0]?.name;

    const result = await runWorkflowLoop(id, execution.workflow_id, execution.workflow_version, nextStepId, execution.data, logs, workflowName, execution.requester_name, execution.requester_email);
    
    return res.send(renderStatusPage("Approved!", "The request has been approved and the workflow is proceeding to the next step.", 'success'));
  } catch (error) {
    console.error("Response Error:", error);
    res.status(500).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #fff1f2;">
        <h1 style="color: #be123c;">Server Error</h1>
        <p style="color: #9f1239; font-size: 1.1em;">Failed to process your response: ${error.message}</p>
        <div style="margin-top: 30px;"><a href="http://localhost:3000" style="color: #6b21a8; text-decoration: none;">Return to Dashboard</a></div>
      </div>
    `);
  }
};

export const getExecutions = async (req, res) => {
  try {
    const { role, email } = req.user;
    let result;
    
    if (role === "admin") {
      result = await pool.query(
        "SELECT e.*, w.name as workflow_name FROM executions e LEFT JOIN workflows w ON e.workflow_id = w.id ORDER BY e.started_at DESC"
      );
    } else {
      result = await pool.query(
        "SELECT e.*, w.name as workflow_name FROM executions e LEFT JOIN workflows w ON e.workflow_id = w.id WHERE e.requester_email = $1 ORDER BY e.started_at DESC",
        [email]
      );
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching executions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getExecution = async (req, res) => {
  try {
    const { role, email } = req.user;
    const result = await pool.query("SELECT * FROM executions WHERE id=$1", [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Execution not found" });
    }
    
    const execution = result.rows[0];
    if (role !== "admin" && execution.requester_email !== email) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.json(execution);
  } catch (err) {
    console.error("Error fetching execution:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelExecution = async (req, res) => {
  await pool.query("UPDATE executions SET status='canceled' WHERE id=$1", [req.params.id]);
  res.json({ status: "canceled" });
};

export const retryExecution = async (req, res) => {
  const executionRes = await pool.query("SELECT * FROM executions WHERE id=$1", [req.params.id]);
  if (executionRes.rows.length === 0) return res.status(404).json("Execution not found");
  const execution = executionRes.rows[0];
  
  const workflowRes = await pool.query("SELECT name FROM workflows WHERE id=$1", [execution.workflow_id]);
  const workflowName = workflowRes.rows[0]?.name;

  await pool.query("UPDATE executions SET status='in_progress', retries=retries+1 WHERE id=$1", [req.params.id]);
  const result = await runWorkflowLoop(execution.id, execution.workflow_id, execution.workflow_version, execution.current_step_id, execution.data, execution.logs, workflowName, execution.requester_name, execution.requester_email);
  res.json(result);
};
