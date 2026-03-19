import {Router} from "express";
import {createWorkflow,getWorkflows,getWorkflowById,updateWorkflow,deleteWorkflow,restoreWorkflow} from "../controller/workflow.controller.js";

const router = Router();

router.post("/", createWorkflow);
router.get("/", getWorkflows);
router.get("/:id", getWorkflowById);
router.put("/:id", updateWorkflow);
router.delete("/:id", deleteWorkflow);
router.post("/:id/restore/:version", restoreWorkflow);

export default router;
