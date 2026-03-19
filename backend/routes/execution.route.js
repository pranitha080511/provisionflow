import { Router } from "express";
import { executeWorkflow, getExecutions, getExecution, cancelExecution, retryExecution, respondToApproval } from "../controller/execution.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.all("/executions/:id/respond", respondToApproval);
router.use(authMiddleware);

router.post("/workflows/:workflow_id/execute", executeWorkflow);
router.get("/executions", getExecutions);
router.get("/executions/:id", getExecution);
router.post("/executions/:id/cancel", cancelExecution);
router.post("/executions/:id/retry", retryExecution);

export default router;