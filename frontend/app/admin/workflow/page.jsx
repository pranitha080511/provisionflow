"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateWorkflow() {

  const router = useRouter();

  const [step, setStep] = useState(1);

  const [workflow, setWorkflow] = useState({
    name: "",
    inputs: [{ label: "", type: "" }],
    steps: []
  });

  const addInput = () => {
    setWorkflow({
      ...workflow,
      inputs: [...workflow.inputs, { label: "", type: "" }]
    });
  };

  const removeInput = (index) => {
    const newInputs = [...workflow.inputs];
    newInputs.splice(index, 1);
    setWorkflow({ ...workflow, inputs: newInputs });
  };

  const updateInput = (index, field, value) => {
    const newInputs = [...workflow.inputs];
    newInputs[index][field] = value;
    setWorkflow({ ...workflow, inputs: newInputs });
  };

  const addStep = () => {
    setWorkflow({
      ...workflow,
      steps: [
        ...workflow.steps,
                                {
          name: "",
          type: "task",
          rules: [{ condition: "", next_step_index: "" }],
          collectEmail: false,
          email: "",
          emailSubject: "",
          emailBody: ""
        }
      ]
    });
  };

  const removeStep = (index) => {
    const newSteps = [...workflow.steps];
    newSteps.splice(index, 1);
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...workflow.steps];
    newSteps[index][field] = value;
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const addRule = (stepIndex) => {
    const newSteps = [...workflow.steps];
    newSteps[stepIndex].rules.push({ condition: "", next_step_index: "" });
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const removeRule = (stepIndex, ruleIndex) => {
    const newSteps = [...workflow.steps];
    newSteps[stepIndex].rules.splice(ruleIndex, 1);

    if (newSteps[stepIndex].rules.length === 0) {
      newSteps[stepIndex].rules = [{ condition: "", next_step_index: "" }];
    }

    setWorkflow({ ...workflow, steps: newSteps });
  };

  const updateRule = (stepIndex, ruleIndex, field, value) => {
    const newSteps = [...workflow.steps];
    newSteps[stepIndex].rules[ruleIndex][field] = value;
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const goToStep3 = () => {
    if (workflow.steps.length === 0) {
      alert("Please add at least one step.");
      return;
    }
    setStep(3);
  };

  const saveWorkflow = async () => {
    if (!workflow.name.trim()) {
      alert("Workflow name is required");
      return;
    }

    if (workflow.steps.length === 0) {
      alert("Workflow must contain at least one step");
      return;
    }

    try {
      // 1. Create Workflow
      const wfRes = await api.post("/workflows", {
        name: workflow.name,
        input_schema: workflow.inputs,
      });

      const workflowId = wfRes.data.id;

      // 2. Create Steps and keep track of their IDs
      const stepIdsMap = []; // index -> db_id

      for (let i = 0; i < workflow.steps.length; i++) {
        const stepData = workflow.steps[i];
        const stepRes = await api.post(`/workflows/${workflowId}/steps`, {
          name: stepData.name,
          step_type: stepData.type,
          order: i + 1,
          metadata: {
            collectEmail: stepData.collectEmail,
            email: stepData.email,
            notificationEmail: stepData.notificationEmail,
            emailSubject: stepData.emailSubject,
            emailBody: stepData.emailBody
          },
        });
        stepIdsMap[i] = stepRes.data.id;
      }

      // 3. Create Rules with correct next_step_id
      for (let i = 0; i < workflow.steps.length; i++) {
        const stepData = workflow.steps[i];
        const stepId = stepIdsMap[i];

        if (stepData.rules && stepData.rules.length > 0) {
          for (let j = 0; j < stepData.rules.length; j++) {
            const ruleObj = stepData.rules[j];
            if (ruleObj.condition.trim() || ruleObj.next_step_index !== "") {
              const nextStepId = ruleObj.next_step_index === "end" ? null : 
                               (ruleObj.next_step_index !== "" ? stepIdsMap[parseInt(ruleObj.next_step_index)] : null);

              await api.post(`/steps/${stepId}/rules`, {
                condition: ruleObj.condition || "DEFAULT",
                priority: j + 1,
                next_step_id: nextStepId
              });
            }
          }
        }
      }

      alert("Workflow Created Successfully");
      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("Failed to create workflow: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="flex justify-center items-start pt-10">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-2xl shadow-xl">
        {step === 1 && (

          <div className="space-y-6">

            <h2 className="text-2xl font-bold">
              Create Workflow
            </h2>

            <input
              value={workflow.name}
              placeholder="Workflow Name"
              className="w-full p-3 bg-gray-800 rounded"
              onChange={(e) =>
                setWorkflow({ ...workflow, name: e.target.value })
              }
            />

            <h3 className="text-lg font-semibold">
              Workflow Inputs
            </h3>

            {workflow.inputs.map((input, index) => (

              <div key={index} className="flex gap-3">

                <input
                  value={input.label}
                  placeholder="Field Name"
                  className="flex-1 p-2 bg-gray-800 rounded"
                  onChange={(e) =>
                    updateInput(index, "label", e.target.value)
                  }
                />

                <input
                  value={input.type}
                  placeholder="Data Type"
                  className="flex-1 p-2 bg-gray-800 rounded"
                  onChange={(e) =>
                    updateInput(index, "type", e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={addInput}
                  className="bg-green-600 px-3 rounded"
                >
                  +
                </button>

                {workflow.inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="bg-red-600 px-3 rounded"
                  >
                    -
                  </button>
                )}

              </div>

            ))}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-purple-600 px-6 py-2 rounded"
            >
              Next
            </button>

          </div>

        )}

        {step === 2 && (

          <div className="space-y-6">

            <h2 className="text-2xl font-bold">
              Workflow Steps
            </h2>

            {workflow.steps.map((stepItem, index) => (

              <div key={index} className="space-y-4">
                <div className="flex gap-3">

                  <input
                    value={stepItem.name}
                    placeholder="Step Name"
                    className="flex-1 p-2 bg-gray-800 rounded"
                    onChange={(e) =>
                      updateStep(index, "name", e.target.value)
                    }
                  />

                  <select
                    value={stepItem.type}
                    className="p-2 bg-gray-800 rounded"
                    onChange={(e) =>
                      updateStep(index, "type", e.target.value)
                    }
                  >
                    <option value="task">Task</option>
                    <option value="approval">Approval</option>
                    <option value="notification">Notification</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="bg-red-600 px-3 rounded"
                  >
                    -
                  </button>

                </div>

                {(stepItem.type === "approval" || stepItem.type === "notification") && (
                  <div className="bg-gray-800 p-4 rounded space-y-3 mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`collectEmail-${index}`}
                        checked={stepItem.collectEmail || false}
                        onChange={(e) => updateStep(index, "collectEmail", e.target.checked)}
                      />
                      <label htmlFor={`collectEmail-${index}`} className="text-sm font-medium">
                        Collect Email / Send Notification
                      </label>
                    </div>

                    {(stepItem.collectEmail || stepItem.type === "notification") && (
                      <div className="space-y-3">
                        {stepItem.type === "approval" ? (
                          <input
                            value={stepItem.email || ""}
                            placeholder="Approver Email"
                            className="w-full p-2 bg-gray-700 rounded text-sm"
                            onChange={(e) => updateStep(index, "email", e.target.value)}
                          />
                        ) : (
                          <div className="p-2 bg-purple-900/20 border border-purple-500/30 rounded text-[10px] text-purple-300">
                            ℹ️ This notification will be automatically sent to the <strong>workflow requester's email</strong>.
                          </div>
                        )}
                        <input
                          value={stepItem.emailSubject || ""}
                          placeholder="Email Subject"
                          className="w-full p-2 bg-gray-700 rounded text-sm"
                          onChange={(e) => updateStep(index, "emailSubject", e.target.value)}
                        />
                        <textarea
                          value={stepItem.emailBody || ""}
                          placeholder="Email Content / Message"
                          className="w-full p-2 bg-gray-700 rounded h-20 text-sm"
                          onChange={(e) => updateStep(index, "emailBody", e.target.value)}
                        />
                        {stepItem.type === "approval" && (
                          <div className="text-[10px] text-gray-400 italic">
                            * Approve/Decline buttons will be automatically included in the email.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

            ))}

            <button
              type="button"
              onClick={addStep}
              className="bg-green-600 px-4 py-2 rounded"
            >
              + Add Step
            </button>

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-600 px-6 py-2 rounded"
              >
                Back
              </button>

              <button
                type="button"
                onClick={goToStep3}
                className="bg-purple-600 px-6 py-2 rounded"
              >
                Next
              </button>

            </div>

          </div>

        )}

        {step === 3 && (

          <div className="space-y-6">

            <h2 className="text-2xl font-bold">
              Step Rules
            </h2>

            {workflow.steps.map((stepItem, stepIndex) => (

              <div
                key={stepIndex}
                className="space-y-3 border border-gray-700 p-4 rounded"
              >

                <h3 className="font-semibold">
                  {stepItem.name}
                </h3>

                {(stepItem.rules || [{ condition: "", next_step_index: "" }]).map((rule, ruleIndex) => (
                  <div key={ruleIndex} className="flex gap-2 items-center">
                    <input
                      value={rule.condition}
                      placeholder="Condition (e.g. age > 18)"
                      className="flex-1 p-2 bg-gray-800 rounded text-sm"
                      onChange={(e) =>
                        updateRule(stepIndex, ruleIndex, "condition", e.target.value)
                      }
                    />
                    
                    <span className="text-gray-500">→</span>

                    <select
                      value={rule.next_step_index}
                      className="w-1/3 p-2 bg-gray-800 rounded text-sm"
                      onChange={(e) =>
                        updateRule(stepIndex, ruleIndex, "next_step_index", e.target.value)
                      }
                    >
                      <option value="">Select Next Step</option>
                      <option value="end">End Workflow</option>
                      {workflow.steps.map((s, idx) => (
                        idx !== stepIndex && (
                          <option key={idx} value={idx}>
                            Step {idx + 1}: {s.name || "Unnamed"}
                          </option>
                        )
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => addRule(stepIndex)}
                      className="bg-green-600 px-3 py-1 rounded text-sm"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeRule(stepIndex, ruleIndex)}
                      className="bg-red-600 px-3 py-1 rounded text-sm"
                    >
                      -
                    </button>
                  </div>
                ))}

              </div>

            ))}

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-600 px-6 py-2 rounded"
              >
                Back
              </button>

              <button
                type="button"
                onClick={saveWorkflow}
                className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-2 rounded"
              >
                Create Workflow
              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}