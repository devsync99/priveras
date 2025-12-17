// lib/pia/piaPrompts.ts

export const piaPrompts: Record<string, string> = {
  "Executive Summary Section": `[INSTRUCTION]: 
ROLE: Senior Privacy Analyst. 
TASK: Synthesize a high-level executive summary. 

STEPS: 1) Draft "Introduction" summarizing the initiative. 
2) Summarize "Privacy Findings". 
3) List critical "Risks" (High/Medium). 
4) Provide "Conclusions" and "Primary Recommendations". 
OUTPUT: Concise, executive-level language.

STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Introduction and Implementation Details, Summary of Privacy Findings and Actions, Risk Summary, Conclusions, Primary Recommendations`,


  "Introduction Section": `[INSTRUCTION]: ROLE: Technical Writer. TASK: Draft the Introduction section. REQUIREMENTS: Define "Goals of a PIA" specifically for this project. Define "PIA Scope". Outline the "Work Approach". Provide "Project Background" context derived strictly from the Project Charter. STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Introduction, Goals of a PIA, PIA Scope, Work Approach and Process, Privacy Introduction, Project Background
`,


  "Project Description": `[INSTRUCTION]: ROLE: Project Manager / Privacy Lead. TASK: Write a detailed Project Description. SECTIONS: 1) "Goals" (Short/Long term). 2) "Partners/Stakeholders" list. 3) "Terminology" definitions. 4) Explicit "In Scope" vs "Out of Scope" lists based on the Solution Architecture. STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Introduction to Project, Terminology / Acronyms, Project Partners and Stakeholders, Project Goals and Outcomes, Project Scope (In/Out)`,


  "Scope of the Privacy Analysis": `[INSTRUCTION]: ROLE: Privacy Consultant. TASK: Define the boundaries of the Privacy Analysis. INSTRUCTION: Explicitly state what data/systems are "In PIA Scope" versus "Out of PIA Scope". Describe the "Method" used (e.g., FIPPA compliance review, TRA analysis). STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: In PIA Scope, Out of PIA Scope, Method`,


  "Business Processes": `[INSTRUCTION]: ROLE: Business Analyst. TASK: Map the Business Processes. REQUIREMENTS: 1) Describe "User Journey". 2) Draft the specific "Notice of Collection" text required by law. 3) Detail "Inquiry Management" and "Case Escalation" workflows. STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Business Process / User Journey, Notice of Collection, Inquiry Management, Case Escalation`,


  "IT Systems & Applications": `[INSTRUCTION]: ROLE: Solutions Architect. TASK: Perform Technical Analysis. DETAILS: List "IT Systems" involved. Describe "Data Transmission" methods (specifically API Gateway/Encryption). Detail "Infrastructure Environment" (Azure/On-Prem) and "Testing Environments". STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: IT Systems and Applications, Transmission of Data, Infrastructure Environment, API Gateway, Testing & Deployment`,


  "Data Flow & Data Handling": `[INSTRUCTION]: ROLE: Data Architect. TASK: Detail Data Handling specifics. REQUIREMENTS: 1) Describe "Data Flow" and "Storage Architecture". 2) Create a "Retention and Destruction" table. 3) Define "FOI Capabilities" and "Directories of Records". STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Data Flow, Data Transmission/Storage, Directories of Records, Retention and Destruction, FOI Capabilities`,


  "Access Controls": `[INSTRUCTION]: ROLE: Security Analyst. TASK: Define Access Control models. OUTPUT: 1) List "Entities with Access". 2) Generate an "Access Table" with roles/permissions. 3) Describe "Audit Trails" and "Special/Elevated Access" protocols (PAM). STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Entities with Access, Access Table, Role and Access Hierarchy, Audit Trails, Special Access`,


  "Privacy Roles & Responsibilities": `[INSTRUCTION]: ROLE: Privacy Officer. TASK: Governance definition. STEPS: 1) Define specific "Privacy Roles". 2) Summarize "Threat Risk Assessment (TRA)" status. 3) Assign "Accountability" for data stewardship to specific job titles. STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Privacy Roles, TRA Status, Accountability Assignments`,


  "Privacy Summary or Analysis": `[INSTRUCTION]: ROLE: Legal/Privacy Subject Matter Expert. TASK: Deep Privacy Analysis. REQUIREMENTS: Verify "Legislative Compliance" (FIPPA). Analyze against all 10 Privacy Principles: Accountability, Purpose, Consent, Limiting Collection, Limiting Use, Accuracy, Safeguards, Openness, Access, Challenging Compliance. STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Legislative Compliance, Analysis Against Privacy Principles (1-10)`,


  "Risk Assessment & Mitigation": `[INSTRUCTION]: ROLE: Risk Manager. TASK: Conduct Risk Assessment. OUTPUT: 1) Identify "Privacy Issues". 2) Populate the "Privacy Risks Table" with Severity ratings (High/Med/Low). 3) Draft a comprehensive "Remediation Plan" for each risk. STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Privacy Issues Identified, Privacy Risks Table, Remediation Plan`,


  "Appendices": `[INSTRUCTION]: ROLE: Technical Writer. TASK: Generate Appendices. CONTENT: Attach "Data Model" summary. Define "Personal Information". List all "Reviewed Documentation" and "Acronyms" used in the report. STRICT CONSTRAINT: All assertions must be cited from the uploaded documents (Charter, Architecture, Legal Opinion). If a fact is not found, output '[MISSING_DATA: ]'. DO NOT invent technical specifications or legal clauses. Ensure response is LENGTHY, DETAILED, and matches the depth of a formal government report.
[CONSTRAINTS]: ANTI-HALLUCINATION MODE: ON. Strictly ground all assertions in provided artifacts (Project Charter, Solution Arch). If data is missing, output [MISSING_DATA].
[SUBHEADINGS TARGET]: Data Model, Definition of Personal Information, Reviewed Documentation, Acronyms`,
};
