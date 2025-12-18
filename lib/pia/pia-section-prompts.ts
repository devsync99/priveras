// lib/pia/piaPrompts.ts

export const piaPrompts: Record<string, string> = {
  "Executive Summary Section": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Project Charter**, **Risk Assessment**, and **Executive Summary** section of the sample PIA, generate the **'4. Executive Summary Section'**.
**Specific Content Requirements:**
1.  **Executive Summary:** Write a detailed narrative (minimum 3 paragraphs) summarizing the project.
    * *Paragraph 1:* Contextualize the move from the legacy **HR-ASRTT (MS Access)** to **Microsoft Dynamics 365**.
    * *Paragraph 2:* Detail the specific scope of Phase 2 (Grievance Management) versus Phase 3.
    * *Paragraph 3:* Identify the key project partners (HRAS, TBS, GSIC) and their roles.
2.  **Summary of Privacy Findings:** Write a detailed analysis of the top risks identified (e.g., Lack of Consent, Retention Gaps, Legacy Decommissioning). Do not just list them; explain the implication of each.
3.  **Risk Summary (Table):** Create a summary table showing the count of High, Medium, and Low risks based explicitly on the *Mitigation Plan*.
    * *Constraint:* Ensure the table renders vertically. Example:
        | Risk Level | Count |
        | :--- | :--- |
        | High | X |
        | Medium | Y |
        | Low | Z |
4.  **Primary Recommendations:** Provide a detailed **bulleted list** of the top 3-5 recommendations to mitigate the risks identified, referencing the specific *Mitigation Plan* actions.
`,

  "Introduction Section": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Full PIA** text and **Project Charter**, generate the **'5. Introduction Section'**.
**Specific Content Requirements:**
1.  **Introduction:** Write 2 full paragraphs introducing the modernization project, the Ministry (MPBSD), and the Division (HR Service Delivery).
2.  **Goals of a PIA:** Provide a detailed list of 6 bullet points explaining why a PIA is performed (e.g., Compliance, Risk Mitigation, Accountability), expanding on each point with a full sentence.
3.  **Work Approach:** Describe the methodology used in detail (e.g., "The assessment involved a comprehensive review of the Project Charter, Data Models..."). Mention FIPPA compliance.
4.  **Extensibility / Amendment to a PIA:** Explain in detail that this PIA covers **Phase 2** and that a subsequent amendment will be required for **Phase 3** (Full Implementation) or new features like Portals.
5.  **Project Background:** Write a highly detailed narrative (3-4 paragraphs) contrasting the 'Current State' with the 'Future State'.
    * *Current State:* Explicitly detail the pain points of using Outlook, OneNote, and the legacy MS Access database (HR-ASRTT).
    * *Future State:* Describe the benefits of the Dynamics 365 solution.
`,


  "Project Description": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Project Charter** and **Solution Architecture**, generate the **'6. Project Description'** section.
**Specific Content Requirements:**
1.  **Project Description:** Provide a comprehensive overview of the HRAS Modernization initiative.
2.  **Project Scope (Table):** Create a detailed table with columns: *Component*, *In-Scope/Out-of-Scope*, and *Detailed Description*.
    * *In Scope:* Dynamics CRM, Knowledge Management, Phase 2 Grievance Management.
    * *Out of Scope:* Self-Service Portals, IVR, Payroll Integration.
3.  **Project Partners and Stakeholders (List):** Provide a detailed list of all stakeholders (HRAS, TBS, GSIC, Unions like OPSEU/AMAPCEO). For each partner, write a full paragraph explaining their specific role and interest in the project.
4.  **Project Goals and Outcomes:**
    * **Short Term Goals:** Detail immediate objectives (e.g., MVP Launch, Replace OneNote).
    * **Medium/Long Term Goals:** Detail future objectives (e.g., Decommissioning HR-ASRTT, Enterprise Rollout).
    * **Target Outcomes:** Detail the expected business benefits (e.g., Data Integrity, Efficiency).
    `,


  "Scope of the Privacy Analysis": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Full PIA** document, generate the **'7. Scope of the Privacy Analysis'** section.
**Specific Content Requirements:**
1.  **Scope of Privacy Analysis:** Write a detailed paragraph explaining that this analysis focuses specifically on the 'Net New' changes introduced by Microsoft Dynamics 365 and the specific data flows involved in Grievance Management.
2.  **In PIA Scope (Bulleted List):** List and describe the specific components being analyzed (Dynamics CRM, Knowledge Management Module, Access Controls, Data Retention). Expand on *why* each is in scope.
3.  **Out of PIA Scope (Bulleted List):** List and describe components excluded from this specific assessment (Legacy Systems not yet decommissioned, HR functions outside of HRAS, External Payroll systems). Explain *why* they are out of scope.
  `,


  "Business Processes": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Grievance Management Process Flow**, **Data Dictionary**, and **Business Process** sections, generate the **'8. Business Processes'** section.
**Specific Content Requirements:**
1.  **Business Process (Detailed Narrative):** Write a step-by-step narrative (minimum 4 paragraphs) describing the full lifecycle of a grievance.
    * *Intake:* Detail how a case is logged in CRM and what data is captured.
    * *Consultation:* Describe the collaboration between the HRA and Employee Relations (ER).
    * *Resolution:* Detail the Formal Resolution Stage (FRS) meeting and the Memorandum of Settlement (MoS).
2.  **Data Management (Table):** Create a table mapping process steps to data. Columns: *Process Stage*, *Data Elements Collected*, *User Roles Involved*. Use the **Data Dictionary** to populate this accurately.
3.  **Notice of Collection:** Write a paragraph describing how individuals are notified about the collection of their data. If this is missing in the docs, explicitly identify it as a gap/risk.
`,


  "IT Systems & Applications": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Solution Architecture** and **IT Systems** sections, generate the **'9. IT Systems & Applications'** section.
**Specific Content Requirements:**
1.  **IT Systems and Applications:** Provide a detailed description of each system:
    * **Microsoft Dynamics 365:** Describe its role as the core platform.
    * **SharePoint:** Describe its use for document storage.
    * **Azure Active Directory:** Describe its role in authentication.
    * **Legacy HR-ASRTT:** Describe the system being replaced.
2.  **Transmission of Data:** Explain in detail how data moves between these systems (e.g., Internal Network, TLS Encryption).
3.  **Infrastructure Environment:** Describe the hosting environment fully (e.g., Microsoft Azure Cloud, Canada Central Region). Mention specific encryption standards (TLS, AES-256) found in the architecture documents.`,


  "Data Flow & Data Handling": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Data Model**, **Architecture**, and **Retention** documents, generate the **'10. Data Flow & Data Handling'** section.
**Specific Content Requirements:**
1.  **Data Flow Description:** Describe the end-to-end flow of Personal Information (PI) from collection (e.g., Grievance Form) to storage (CRM/SharePoint) to eventual archiving.
2.  **Storage Architecture:** Detail the security controls for storage, specifically mentioning Azure Cloud, Canadian residency, and AES-256 encryption at rest.
3.  **Retention and Destruction (Table):** Create a detailed table with columns: *Data Type* (e.g., Grievance Case Files, System Logs), *Retention Period* (e.g., 'As per OPS Records Schedule'), and *Destruction Method*.
4.  **Personal Information Banks (PIBs):** State clearly whether a PIB is required or currently exists, referencing Risk RSK-002 if applicable.`,


  "Access Controls": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Access Control** section of the *Full PIA* and the **Project Charter**, generate the **'11. Access Controls'** section.
**Specific Content Requirements:**
1.  **Access Controls Overview:** Describe the implementation of Role-Based Access Control (RBAC) and Azure AD Multi-Factor Authentication (MFA).
2.  **Entities with Access (Table):** Create a comprehensive table with columns: *Role* (e.g., HRA, Manager, System Admin), *Access Level* (Read/Write/Admin), and *Purpose of Access*. Ensure this covers all roles in the Governance section.
3.  **Audit Trails:** detailed description of how the system logs access, including what specific data points are captured in the logs (Who, What, When).
4.  **Periodic Access Reviews:** Describe the requirement for quarterly reviews of user permissions.`,


  "Security Assessments": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Risk Assessment** and **Executive Summary** documents, generate the **'12. Security Assessments'** section.

**Specific Content Requirements:**
1.  **Threat Risk Assessment (TRA):** State the exact status of the TRA. If it is "Planned" or "Kick-off scheduled", state that explicitly with the date (e.g., Feb 2025). Do not imply it is complete if the documents say otherwise.
2.  **Security Safeguards:** Describe the technical security measures in place (e.g., Firewalls, Encryption, Secure Cloud environment).
3.  **Accountability:** Explicitly state which body is responsible for security oversight (e.g., GSIC, Security Branch).`,

  

  "Privacy Summary or Analysis": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Privacy Analysis** section of the *Full PIA*, generate the **'13. Privacy Summary or Analysis'** section.
**Specific Content Requirements:**
1.  **Legislative Compliance:** List and briefly explain the applicable laws (FIPPA, MFIPPA, Employment Standards Act).
2.  **Analysis Against Privacy Principles:** Provide a detailed, paragraph-length analysis for EACH of the 10 principles:
    * *Accountability*
    * *Identifying Purposes*
    * *Consent* (Highlight gaps/risks here)
    * *Limiting Collection*
    * *Limiting Use, Disclosure, Retention* (Highlight retention schedule gaps here)
    * *Accuracy*
    * *Safeguards*
    * *Openness*
    * *Individual Access*
    * *Challenging Compliance*`,


  "Risk Assessment & Mitigation": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the **Mitigation Plan Template** and **Risk Summary** in the *Full PIA*, generate the **'14. Risk Assessment & Mitigation'** section.
**Specific Content Requirements:**
1.  **Privacy Risks Table:** Create a comprehensive Markdown table with the following columns:
    * *Risk ID* (e.g., RSK-001)
    * *Privacy Issue* (Detailed description of the risk)
    * *Risk Rating* (High/Medium/Low)
    * *Recommendation/Mitigation* (Specific, actionable steps to fix it)
    * *Owner* (Who is responsible)
2.  **Remediation Summary:** Write a concluding summary on the overall risk posture.
3.  **Mandatory Inclusions:** Ensure the following specific risks from the documents are included:
    * Lack of Consent (RSK-001)
    * Undefined Retention Schedules (RSK-003)
    * Legacy System Decommissioning (RSK-005)`,


  "Appendices": `Source of Truth: You must ONLY use the provided context documents (Project Charter, Architecture, Process Flows, Data Dictionaries, and Templates). DO NOT use outside knowledge or internet data. If specific information is not in the documents, output [MISSING DATA: <Description of missing info>].
Formatting: You must use Markdown. Use ### for Section Headers, #### for Sub-headers.
**Table Formatting Rule:** When creating tables, you MUST ensure that the Header, the Separator line (e.g., |---|), and EACH data row are separated by a new line (carriage return). Do not write tables on a single line.
Tone & Length: The output must be verbose, professional, and detailed. Do not summarize; expand on every point. Use full sentences and government-standard terminology.
Citations: Every assertion must be cited using the format.
Structure: Follow the specific headings and sub-headings requested in the prompt exactly.
**Intelligent Expansion:** You are empowered to improve the quality of the response. If you find relevant information in the documents that strengthens the section but was not explicitly asked for in the specific requirements, YOU MUST INCLUDE IT. Do not leave out critical details just because they weren't requested. Be comprehensive.
---
**Task:** Using the list of **Uploaded Files** and the **Acronyms** section, generate the **'15. Appendices'** section.
**Specific Content Requirements:**
1.  **Reviewed Documentation (Table):** Create a table listing all documents available in the context (File Name and Brief Description).
2.  **Acronyms and Definitions (Table):** Create a table of acronyms used in the report (e.g., HRAS, PIA, TRA, FIPPA, GSIC, HRA, WIN).
3.  **Business and Stakeholder Review:** Create a placeholder signature block for the Project Sponsors and Privacy Office.`,
};