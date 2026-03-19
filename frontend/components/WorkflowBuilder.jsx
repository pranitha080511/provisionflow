"use client";

import { useState, useEffect } from "react";

export default function WorkflowBuilder({ initialData, onSubmit }) {

const [workflow,setWorkflow] = useState({
name:"",
inputs:[{label:"",type:""}],
steps:[]
});

useEffect(()=>{

if(initialData){

const fixedSteps = (initialData.steps || []).map(step => ({
...step,
rules: step.rules && step.rules.length ? 
  step.rules.map(r => typeof r === 'string' ? { condition: r, next_step_index: "" } : r) : 
  [{ condition: "", next_step_index: "" }]
}));

setWorkflow({
...initialData,
inputs: initialData.inputs || [{label:"",type:""}],
steps: fixedSteps
});

}

},[initialData]);

const addInput = () => {

setWorkflow({
...workflow,
inputs:[...workflow.inputs,{label:"",type:""}]
});

};

const removeInput = (index) => {

const newInputs=[...workflow.inputs];
newInputs.splice(index,1);

setWorkflow({...workflow,inputs:newInputs});

};

const updateInput=(index,field,value)=>{

const newInputs=[...workflow.inputs];
newInputs[index][field]=value;

setWorkflow({...workflow,inputs:newInputs});

};

const addStep=()=>{

setWorkflow({
...workflow,
      steps:[
        ...workflow.steps,
        {
          name:"",
          type:"task",
          rules:[{ condition: "", next_step_index: "" }],
          collectEmail: false,
          email: "",
          notificationEmail: "",
          emailSubject: "",
          emailBody: ""
        }
      ]
});

};

const removeStep=(index)=>{

const newSteps=[...workflow.steps];
newSteps.splice(index,1);

setWorkflow({...workflow,steps:newSteps});

};

const updateStep=(index,field,value)=>{

const newSteps=[...workflow.steps];
newSteps[index][field]=value;

setWorkflow({...workflow,steps:newSteps});

};

const addRule=(stepIndex)=>{

const newSteps=[...workflow.steps];
newSteps[stepIndex].rules.push({ condition: "", next_step_index: "" });

setWorkflow({...workflow,steps:newSteps});

};

const removeRule=(stepIndex,ruleIndex)=>{

const newSteps=[...workflow.steps];
newSteps[stepIndex].rules.splice(ruleIndex,1);

if(newSteps[stepIndex].rules.length===0){
newSteps[stepIndex].rules=[{ condition: "", next_step_index: "" }];
}

setWorkflow({...workflow,steps:newSteps});

};

const updateRule=(stepIndex,ruleIndex,field,value)=>{

const newSteps=[...workflow.steps];
newSteps[stepIndex].rules[ruleIndex][field]=value;

setWorkflow({...workflow,steps:newSteps});

};

return(

<div className="space-y-8">

{/* WORKFLOW NAME */}

<input
value={workflow.name}
placeholder="Workflow Name"
className="w-full p-3 bg-gray-800 rounded"
onChange={(e)=>setWorkflow({...workflow,name:e.target.value})}
/>

{/* INPUT FIELDS */}

<h3 className="text-lg font-semibold">
Workflow Inputs
</h3>

{workflow.inputs.map((input,index)=>(
<div key={index} className="flex gap-3">

<input
value={input.label}
placeholder="Field Name"
className="flex-1 p-2 bg-gray-800 rounded"
onChange={(e)=>updateInput(index,"label",e.target.value)}
/>

<input
value={input.type}
placeholder="Data Type"
className="flex-1 p-2 bg-gray-800 rounded"
onChange={(e)=>updateInput(index,"type",e.target.value)}
/>

<button
onClick={addInput}
className="bg-green-600 px-3 rounded"
>
+
</button>

{workflow.inputs.length>1 && (
<button
onClick={()=>removeInput(index)}
className="bg-red-600 px-3 rounded"
>
-
</button>
)}

</div>
))}

{/* STEPS */}

<h3 className="text-lg font-semibold">
Workflow Steps
</h3>

{workflow.steps.map((stepItem,index)=>(
<div key={index} className="border border-gray-700 p-4 rounded space-y-3">

<div className="flex gap-3">

<input
value={stepItem.name}
placeholder="Step Name"
className="flex-1 p-2 bg-gray-800 rounded"
onChange={(e)=>updateStep(index,"name",e.target.value)}
/>

<select
value={stepItem.type}
className="p-2 bg-gray-800 rounded"
onChange={(e)=>updateStep(index,"type",e.target.value)}
>
<option value="task">Task</option>
<option value="approval">Approval</option>
<option value="notification">Notification</option>
</select>

<button
onClick={()=>removeStep(index)}
className="bg-red-600 px-3 rounded"
>
Delete Step
</button>

</div>

{(stepItem.type === "approval" || stepItem.type === "notification") && (
  <div className="bg-gray-800 p-4 rounded space-y-3">
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
          <>
            <input
              value={stepItem.email || ""}
              placeholder="Approver Email"
              className="w-full p-2 bg-gray-700 rounded"
              onChange={(e) => updateStep(index, "email", e.target.value)}
            />
            <input
              value={stepItem.notificationEmail || ""}
              placeholder="Result Notification Email (Optional)"
              className="w-full p-2 bg-gray-700 rounded"
              onChange={(e) => updateStep(index, "notificationEmail", e.target.value)}
            />
          </>
        ) : (
          <div className="p-2 bg-purple-900/20 border border-purple-500/30 rounded text-xs text-purple-300">
            ℹ️ This notification will be automatically sent to the <strong>workflow requester's email</strong>.
          </div>
        )}
        <input
          value={stepItem.emailSubject || ""}
          placeholder="Email Subject"
          className="w-full p-2 bg-gray-700 rounded"
          onChange={(e) => updateStep(index, "emailSubject", e.target.value)}
        />
        <textarea
          value={stepItem.emailBody || ""}
          placeholder="Email Content / Message"
          className="w-full p-2 bg-gray-700 rounded h-24"
          onChange={(e) => updateStep(index, "emailBody", e.target.value)}
        />
        {stepItem.type === "approval" && (
          <div className="text-xs text-gray-400 italic">
            * Approve/Decline buttons will be automatically included in the email.
          </div>
        )}
      </div>
    )}
  </div>
)}

{/* RULES */}

<h4 className="font-semibold">
Rules
</h4>

{(stepItem.rules || [{ condition: "", next_step_index: "" }]).map((rule,ruleIndex)=>(
<div key={ruleIndex} className="flex gap-2 items-center">

<input
value={rule.condition}
placeholder="Condition (e.g. age > 18)"
className="flex-1 p-2 bg-gray-800 rounded text-sm"
onChange={(e)=>updateRule(index,ruleIndex,"condition",e.target.value)}
/>

<span className="text-gray-500">→</span>

<select
  value={rule.next_step_index}
  className="w-1/3 p-2 bg-gray-800 rounded text-sm"
  onChange={(e)=>updateRule(index,ruleIndex,"next_step_index",e.target.value)}
>
  <option value="">Select Next Step</option>
  <option value="end">End Workflow</option>
  {workflow.steps.map((s, idx) => (
    idx !== index && (
      <option key={idx} value={idx}>
        Step {idx + 1}: {s.name || "Unnamed"}
      </option>
    )
  ))}
</select>

<button
onClick={()=>addRule(index)}
className="bg-green-600 px-3 py-1 rounded text-sm"
>
+
</button>

<button
onClick={()=>removeRule(index,ruleIndex)}
className="bg-red-600 px-3 py-1 rounded text-sm"
>
-
</button>

</div>
))}

</div>
))}

<div className="flex gap-4 mt-6">

<button
onClick={addStep}
className="bg-green-600 px-5 py-3 rounded font-semibold hover:opacity-90"
>
Add Step
</button>

<button
onClick={()=>onSubmit(workflow)}
className="bg-purple-600 px-5 py-3 rounded font-semibold hover:opacity-90"
>
Save Workflow
</button>

</div>

</div>

);

}